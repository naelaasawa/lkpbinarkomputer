import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateCertificate } from "@/lib/certificate";

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

        // Check completion
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: id
                }
            }
        });

        if (!enrollment || enrollment.progress < 100) {
            return new NextResponse("Course not completed", { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id: id }
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Generate PDF
        const fullName = user.fullName || "Student";
        const pdfBuffer = await generateCertificate(fullName, course.title);

        // Return as PDF stream
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Certificate-${id}.pdf"`
            }
        });

    } catch (error) {
        console.error("[CERTIFICATE_PREVIEW]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
