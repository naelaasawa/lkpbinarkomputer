import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/courses/[id]/certificate/check
 * Check if certificate is available for the user without generating it
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: courseId } = await params;

        const loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        console.log(`[CERTIFICATE_CHECK] Checking for user ${loggedInUser.id}, course ${courseId}`);

        // Find the final quiz for this course
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
            select: {
                id: true,
                title: true
            }
        });

        if (!finalQuiz) {
            console.log(`[CERTIFICATE_CHECK] No final quiz found for course ${courseId}`);
            return NextResponse.json(
                {
                    available: false,
                    error: "No final quiz configured for this course."
                },
                { status: 404 }
            );
        }

        console.log(`[CERTIFICATE_CHECK] Final quiz found: ${finalQuiz.id} - ${finalQuiz.title}`);

        // Check if user has completed the final quiz
        const quizAttempt = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId: loggedInUser.id,
                    quizId: finalQuiz.id
                }
            },
            select: {
                status: true,
                score: true,
                completedAt: true
            }
        });

        console.log(`[CERTIFICATE_CHECK] Quiz attempt:`, quizAttempt);

        if (!quizAttempt || quizAttempt.status !== 'completed') {
            console.log(`[CERTIFICATE_CHECK] Final quiz not completed`);
            return NextResponse.json(
                {
                    available: false,
                    error: "Certificate not available. Please complete the final quiz."
                },
                { status: 403 }
            );
        }

        console.log(`[CERTIFICATE_CHECK] ✅ Final quiz completed with score ${quizAttempt.score}%`);

        // Get enrollment for predicate (if exists)
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId
                }
            },
            select: {
                finalPredicate: true,
                finalScore: true
            }
        });

        // Certificate is available
        return NextResponse.json({
            available: true,
            predicate: enrollment?.finalPredicate || null,
            score: quizAttempt.score
        });

    } catch (error) {
        console.error("[CERTIFICATE_CHECK] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
