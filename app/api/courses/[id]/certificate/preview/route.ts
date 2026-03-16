import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateCertificate } from "@/lib/certificate";
import { generateCertificateNumber } from "@/lib/certificate-number";
import { generateCertificateQR } from "@/lib/qrcode";

export async function GET(
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
        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Find final quiz for this course
        const finalQuiz = await prisma.quiz.findFirst({
            where: {
                isFinalQuiz: true,
                lessons: {
                    some: {
                        module: {
                            courseId: id
                        }
                    }
                }
            }
        });

        if (!finalQuiz) {
            // Fallback: try any quiz in this course if no isFinalQuiz is set
            const anyQuiz = await prisma.quiz.findFirst({
                where: {
                    lessons: {
                        some: {
                            module: {
                                courseId: id
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (!anyQuiz) {
                console.log(`[CERTIFICATE_PREVIEW] No quiz found for course ${id}`);
                return new NextResponse("No quiz configured for this course", { status: 404 });
            }

            console.log(`[CERTIFICATE_PREVIEW] No isFinalQuiz found, using last quiz as fallback: ${anyQuiz.id}`);
            // Use anyQuiz as the final quiz for preview
            const quizAttemptFallback = await prisma.quizAssignment.findUnique({
                where: {
                    userId_quizId: {
                        userId: loggedInUser.id,
                        quizId: anyQuiz.id
                    }
                }
            });

            if (!quizAttemptFallback || quizAttemptFallback.status !== 'completed') {
                return new NextResponse(
                    JSON.stringify({ error: "Certificate not available. Please complete the final quiz." }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Use fallback quiz attempt for preview
            const course = await prisma.course.findUnique({ where: { id } });
            if (!course) return new NextResponse("Course not found", { status: 404 });

            const existingCertFallback = await prisma.certificate.findFirst({ where: { userId: loggedInUser.id, courseId: id } });
            let certNum: string;
            let qrData: string | undefined;

            if (existingCertFallback) {
                certNum = existingCertFallback.certificateNumber;
                qrData = existingCertFallback.qrCodeData || undefined;
            } else {
                const { number } = await generateCertificateNumber(course.title, new Date());
                certNum = number;
                qrData = await generateCertificateQR(certNum);
            }

            const { calculatePredicate } = await import("@/lib/utils/predicate");
            const scoreFallback = quizAttemptFallback.score ?? 0;
            const predicateFallback = calculatePredicate(scoreFallback) || "Kurang";
            const fullNameFallback = user.fullName || "Student";
            const pdfFallback = await generateCertificate(fullNameFallback, course.title, predicateFallback, certNum, quizAttemptFallback.completedAt || new Date(), qrData);

            return new NextResponse(pdfFallback as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="Certificate-Preview-${id}.pdf"`
                }
            });
        }

        // Check if user completed final quiz
        const quizAttempt = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId: loggedInUser.id,
                    quizId: finalQuiz.id
                }
            }
        });

        if (!quizAttempt || quizAttempt.status !== 'completed') {
            console.log(`[CERTIFICATE_PREVIEW] Final quiz not completed`);
            return new NextResponse(
                JSON.stringify({
                    error: "Certificate not available. Please complete the final quiz."
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const course = await prisma.course.findUnique({
            where: { id: id }
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Check if certificate already exists
        const existingCert = await prisma.certificate.findFirst({
            where: {
                userId: loggedInUser.id,
                courseId: id
            }
        });

        let certificateNumber: string;
        let qrCodeData: string | undefined;

        if (existingCert) {
            // Use existing certificate number and QR
            certificateNumber = existingCert.certificateNumber;
            qrCodeData = existingCert.qrCodeData || undefined;
            console.log(`[CERTIFICATE_PREVIEW] Using existing certificate: ${certificateNumber}`);
        } else {
            // Generate preview certificate number (with PREVIEW prefix)
            try {
                const { number } = await generateCertificateNumber(course.title, new Date());
                certificateNumber = number; // Use generated number directly without PREVIEW prefix
                console.log(`[CERTIFICATE_PREVIEW] Generated preview number: ${certificateNumber}`);

                // Generate QR code for preview
                qrCodeData = await generateCertificateQR(certificateNumber);
            } catch (error: any) {
                console.error(`[CERTIFICATE_PREVIEW] Failed to generate certificate number:`, error);
                return new NextResponse(
                    JSON.stringify({ error: error.message }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
        }

        // Calculate predicate from quiz score
        const { calculatePredicate } = await import("@/lib/utils/predicate");
        const score = quizAttempt.score ?? 0;
        const predicate = calculatePredicate(score) || "Kurang";

        // Generate PDF
        const fullName = user.fullName || "Student";
        const pdfBuffer = await generateCertificate(
            fullName,
            course.title,
            predicate,
            certificateNumber,
            quizAttempt.completedAt || new Date(),
            qrCodeData
        );

        console.log(`[CERTIFICATE_PREVIEW] PDF generated for ${fullName} - ${course.title}`);

        // Return as PDF stream
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Certificate-Preview-${id}.pdf"`
            }
        });

    } catch (error) {
        console.error("[CERTIFICATE_PREVIEW]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
