import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; lessonId: string }> }
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

        const { id, lessonId } = await params;

        // Use transaction to ensure consistency
        const { progressPercentage, completedLessonId } = await prisma.$transaction(async (tx) => {
            // 1. Mark Lesson as Completed
            await tx.userProgress.upsert({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId
                    }
                },
                update: {
                    isCompleted: true
                },
                create: {
                    userId,
                    lessonId,
                    isCompleted: true
                }
            });

            // 2. Recalculate Course Progress
            const course = await tx.course.findUnique({
                where: { id },
                include: {
                    modules: {
                        include: {
                            lessons: true
                        }
                    }
                }
            });

            if (!course) {
                throw new Error("Course not found");
            }

            const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
            const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));

            const completedCount = await tx.userProgress.count({
                where: {
                    userId,
                    lessonId: {
                        in: allLessonIds
                    },
                    isCompleted: true
                }
            });

            const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

            // 3. Update or Create Enrollment (Safe)
            await tx.enrollment.upsert({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: id
                    }
                },
                update: {
                    progress: progressPercentage
                },
                create: {
                    userId,
                    courseId: id,
                    progress: progressPercentage
                }
            });

            return { progressPercentage, completedLessonId: lessonId };
        });

        return NextResponse.json({
            success: true,
            progress: progressPercentage,
            completedLesssonId: completedLessonId
        });

    } catch (error) {
        console.error("[LESSON_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
