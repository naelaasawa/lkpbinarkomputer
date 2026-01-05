import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        const { id: courseId } = await params;

        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Get User ID from DB
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            return new NextResponse("Already enrolled", { status: 400 });
        }

        // 3. Create Enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId,
                progress: 0,
            },
        });

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error("[COURSE_ENROLL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
