import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Diagnostic endpoint to check enrollment and quiz data
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id: courseId } = await params;

        // Get user from database
        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found in database" });
        }

        // Get enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: courseId
                }
            }
        });

        // Get final quiz for this course
        const finalQuiz = await prisma.quiz.findFirst({
            where: {
                type: 'final_exam',
                lessons: {
                    some: {
                        module: {
                            courseId: courseId
                        }
                    }
                }
            },
            include: {
                assignments: {
                    where: {
                        userId: loggedInUser.id
                    }
                }
            }
        });

        return NextResponse.json({
            user: {
                id: loggedInUser.id,
                clerkId: loggedInUser.clerkId,
                email: loggedInUser.email
            },
            enrollment: enrollment ? {
                id: enrollment.id,
                progress: enrollment.progress,
                finalScore: enrollment.finalScore,
                finalPredicate: enrollment.finalPredicate,
                courseCompleted: enrollment.courseCompleted,
                courseCompletedAt: enrollment.courseCompletedAt
            } : null,
            finalQuiz: finalQuiz ? {
                id: finalQuiz.id,
                title: finalQuiz.title,
                type: finalQuiz.type,
                assignment: finalQuiz.assignments[0] || null
            } : null
        });

    } catch (error) {
        console.error("[DEBUG_ENROLLMENT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
