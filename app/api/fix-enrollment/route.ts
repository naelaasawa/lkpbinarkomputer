import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Temporary endpoint to fix enrollment predicate for users who completed final quiz before the fix
export async function POST() {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get user from database
        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const userId = loggedInUser.id;

        // Function to calculate predicate
        function calculatePredicate(score: number): string {
            if (score >= 90) return "Sangat Memuaskan";
            if (score >= 80) return "Memuaskan";
            if (score >= 70) return "Cukup";
            return "Kurang";
        }

        // Find all completed final quiz assignments for this user
        const finalQuizAssignments = await prisma.quizAssignment.findMany({
            where: {
                userId: userId,
                status: 'completed',
                quiz: {
                    type: 'final_exam'
                }
            },
            include: {
                quiz: {
                    include: {
                        lessons: {
                            include: {
                                module: true
                            }
                        }
                    }
                }
            }
        });

        const updates = [];

        for (const assignment of finalQuizAssignments) {
            const lesson = assignment.quiz.lessons[0];
            if (!lesson?.module?.courseId) continue;

            const courseId = lesson.module.courseId;
            const score = assignment.score ?? 0;
            const predicate = calculatePredicate(score);

            // Update enrollment
            await prisma.enrollment.upsert({
                where: {
                    userId_courseId: {
                        userId,
                        courseId
                    }
                },
                create: {
                    userId,
                    courseId,
                    finalScore: score,
                    finalPredicate: predicate
                },
                update: {
                    finalScore: score,
                    finalPredicate: predicate
                }
            });

            updates.push({
                courseId,
                score,
                predicate
            });
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updates.length} enrollment(s)`,
            updates
        });

    } catch (error) {
        console.error("[FIX_ENROLLMENT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
