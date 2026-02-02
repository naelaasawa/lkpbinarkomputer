import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendCertificateEmail } from "@/lib/mail";
import { generateCertificate } from "@/lib/certificate";

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
        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        // Check if course is actually 100% completed
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: id
                }
            }
        });

        if (!enrollment || enrollment.progress < 100) {
            return new NextResponse("Course not completed yet", { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id: id }
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Generate Certificate
        const fullName = user.fullName || "Student";
        let certificateBuffer: Buffer;
        try {
            certificateBuffer = await generateCertificate(fullName, course.title);
            console.log("✅ Certificate generated successfully");
        } catch (certError) {
            console.error("❌ Certificate generation failed:", certError);
            return new NextResponse("Failed to generate certificate", { status: 500 });
        }

        // Save to Database
        // Check if certificate already exists to avoid duplicates
        let certificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: id
                }
            }
        });

        if (!certificate) {
            const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
            certificate = await prisma.certificate.create({
                data: {
                    userId: loggedInUser.id,
                    courseId: id,
                    uniqueId: uniqueId
                }
            });
        }

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
            certificateId: certificate.uniqueId
        });

    } catch (error) {
        console.error("[CERTIFICATE_API] Unexpected error:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
