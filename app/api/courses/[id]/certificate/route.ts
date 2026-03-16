import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendCertificateEmail } from "@/lib/mail";
import { generateCertificate } from "@/lib/certificate";
import { generateCertificateNumber } from "@/lib/certificate-number";
import { generateCertificateQR } from "@/lib/qrcode";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await currentUser();
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [CERTIFICATE_CLAIM] DEBUG START');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📝 Course ID: ${id}`);
        console.log(`👤 Clerk User ID: ${clerkUserId}`);
        console.log(`📧 Clerk Email: ${user.emailAddresses[0]?.emailAddress}`);

        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            console.log('❌ User not found in database');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return new NextResponse("User not found in database", { status: 404 });
        }

        console.log(`💾 DB User ID: ${loggedInUser.id}`);
        console.log(`📧 DB Email: ${loggedInUser.email}`);

        // Check if course is completed and has predicate
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: id
                }
            },
            select: {
                id: true,
                progress: true,
                finalPredicate: true,
                finalScore: true,
                courseCompleted: true,
                courseCompletedAt: true
            }
        });

        console.log('\n📊 Enrollment Data:', JSON.stringify(enrollment, null, 2));

        if (!enrollment || enrollment.progress < 100) {
            console.log(`❌ Course not completed. Progress: ${enrollment?.progress || 0}%`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return new NextResponse("Course not completed yet", { status: 400 });
        }

        // Self-heal: if finalPredicate is missing, calculate it from the user's quiz scores
        let finalPredicate = enrollment.finalPredicate;
        let finalScore = enrollment.finalScore;

        if (!finalPredicate) {
            console.log('⚠️ finalPredicate is missing — attempting self-heal from quiz scores...');

            // Find all quizzes in this course
            const courseQuizzes = await prisma.quiz.findMany({
                where: {
                    lessons: {
                        some: {
                            module: { courseId: id }
                        }
                    }
                },
                select: { id: true, isFinalQuiz: true }
            });

            const quizIds = courseQuizzes.map(q => q.id);
            const finalQuizIds = courseQuizzes.filter(q => q.isFinalQuiz).map(q => q.id);

            // Prefer final quiz score, fallback to best score among all quizzes
            const lookupIds = finalQuizIds.length > 0 ? finalQuizIds : quizIds;

            const bestAttempt = await prisma.quizAssignment.findFirst({
                where: {
                    userId: loggedInUser.id,
                    quizId: { in: lookupIds },
                    status: 'completed'
                },
                orderBy: { score: 'desc' }
            });

            if (!bestAttempt || bestAttempt.score === null) {
                console.log('❌ No completed quiz found for this course');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                return new NextResponse(
                    JSON.stringify({ error: "Certificate not available. Please complete the final quiz first." }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const { calculatePredicate } = await import("@/lib/utils/predicate");
            finalScore = bestAttempt.score;
            finalPredicate = calculatePredicate(finalScore);

            console.log(`✅ Self-healed: score=${finalScore}, predicate=${finalPredicate}`);

            // Save back to enrollment so future claims are instant
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    finalScore,
                    finalPredicate,
                    courseCompleted: true,
                    courseCompletedAt: enrollment.courseCompletedAt || new Date()
                }
            });
        }

        console.log('✅ Validation passed!');
        console.log(`   Final Score: ${finalScore}`);
        console.log(`   Final Predicate: ${finalPredicate}`);


        const course = await prisma.course.findUnique({
            where: { id: id }
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // 1. Generate or Retrieve Certificate Number
        let certificateNumber = "";
        let sequenceNumber = 1;

        // Check if certificate already exists
        let certificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: id
                }
            }
        });

        if (certificate) {
            certificateNumber = certificate.certificateNumber;
        } else {
            // Generate new number
            const certData = await generateCertificateNumber(course.title, new Date());
            certificateNumber = certData.number;
            sequenceNumber = certData.sequence;
        }

        // 2. Generate QR Code
        const qrCodeData = await generateCertificateQR(certificateNumber);

        // 3. Generate PDF
        const fullName = user.fullName || loggedInUser.email.split('@')[0];
        let certificateBuffer: Buffer;

        try {
            certificateBuffer = await generateCertificate(
                fullName,
                course.title,
                finalPredicate!,
                certificateNumber,
                new Date(),
                qrCodeData
            );
            console.log("✅ Certificate generated successfully");
        } catch (certError) {
            console.error("❌ Certificate generation failed:", certError);
            return new NextResponse("Failed to generate certificate", { status: 500 });
        }

        // 4. Save/Update Database
        if (!certificate) {
            certificate = await prisma.certificate.create({
                data: {
                    userId: loggedInUser.id,
                    courseId: id,
                    certificateNumber: certificateNumber,
                    sequenceNumber: sequenceNumber,
                    courseName: course.title,
                    userName: fullName,
                    predicate: finalPredicate!,
                    finalScore: finalScore || 0,
                    completedAt: enrollment.courseCompletedAt || new Date(),
                    qrCodeData: qrCodeData
                }
            });
        } else {
            // Update existing if needed (e.g. valid until?)
            // For now, we keep original
        }

        // 5. Send Email
        // Get email from body if provided, otherwise use login email
        let targetEmail = user.emailAddresses[0].emailAddress;
        try {
            const body = await req.json();
            if (body.email && body.email.includes("@")) {
                targetEmail = body.email;
            }
        } catch (e) {
            // Ignore if no body
        }

        console.log(`📧 Attempting to send certificate to: ${targetEmail}`);
        const emailSent = await sendCertificateEmail(
            targetEmail,
            fullName,
            course.title,
            certificateBuffer
        );

        if (!emailSent) {
            console.error("❌ Email sending failed");
            return new NextResponse("Failed to send email", { status: 500 });
        }

        console.log("✅ Certificate claim completed successfully");
        return NextResponse.json({
            success: true,
            email: targetEmail,
            certificateId: certificate.id
        });

    } catch (error) {
        console.error("[CERTIFICATE_API] Unexpected error:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
