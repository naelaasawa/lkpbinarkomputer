import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        const userId = loggedInUser.id;

        const { id } = await params;

        // Get this course's lesson IDs first to filter UserProgress efficiently
        // (Optional: can just query by userId and join lesson.module.courseId)

        const completedLessons = await prisma.userProgress.findMany({
            where: {
                userId,
                lesson: {
                    module: {
                        courseId: id
                    }
                },
                isCompleted: true
            },
            select: {
                lessonId: true
            }
        });

        return NextResponse.json(completedLessons.map(p => p.lessonId));

    } catch (error) {
        console.error("[COURSE_PROGRESS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
