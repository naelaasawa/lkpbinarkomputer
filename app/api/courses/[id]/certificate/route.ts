import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendCertificateEmail } from "@/lib/mail";

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

        const emailSent = await sendCertificateEmail(
            targetEmail,
            user.fullName || "Student",
            course.title
        );

        if (!emailSent) {
            return new NextResponse("Failed to send email", { status: 500 });
        }

        return NextResponse.json({ success: true, email: targetEmail });

    } catch (error) {
        console.error("[CERTIFICATE_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
