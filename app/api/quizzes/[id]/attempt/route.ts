import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id: quizId } = await params;

        // Find existing quiz attempt for this user
        const attempt = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId,
                    quizId
                }
            }
        });

        if (!attempt) {
            return NextResponse.json(null);
        }

        // Parse answers from JSON string
        const parsedAnswers = attempt.answers ? JSON.parse(attempt.answers) : {};

        const response = {
            id: attempt.id,
            status: attempt.status,
            answers: parsedAnswers,
            score: attempt.score,
            completedAt: attempt.completedAt,
            isLocked: attempt.isLocked,
            canRetake: false, // One-try only - never allow retakes
            ...(attempt.status === 'completed' && {
                message: "Quiz sudah selesai. Tidak dapat mengulang quiz ini."
            })
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("[QUIZ_ATTEMPT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get or create user in database
        let loggedInUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        });

        if (!loggedInUser) {
            console.log(`[QUIZ_ATTEMPT_POST] Creating new user for clerkId: ${clerkUserId}`);
            loggedInUser = await prisma.user.create({
                data: {
                    clerkId: clerkUserId,
                    email: `user_${clerkUserId}@temp.com`,
                    role: 'student'
                }
            });
        }

        const userId = loggedInUser.id;
        const { id: quizId } = await params;
        const body = await req.json();
        const { answers } = body;

        console.log(`[QUIZ_ATTEMPT_POST] User ${userId} (Clerk: ${clerkUserId}) attempting quiz ${quizId}`);

        // CRITICAL: Check if quiz is already completed (ONE-TRY ENFORCEMENT)
        const existingAttempt = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId,
                    quizId
                }
            }
        });

        if (existingAttempt?.status === 'completed' || existingAttempt?.isLocked) {
            console.log(`[QUIZ_ATTEMPT_POST] ❌ Rejected retake attempt for user ${userId}, quiz ${quizId}`);
            return NextResponse.json(
                {
                    error: "Lesson Complete",
                    status: "completed",
                    isLocked: true
                },
                { status: 403 }
            );
        }

        // Get quiz with questions to calculate score
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        });

        if (!quiz) {
            return new NextResponse("Quiz not found", { status: 404 });
        }

        // Calculate score
        let correctCount = 0;
        quiz.questions.forEach((question, idx) => {
            const userAnswer = answers[idx.toString()];
            if (userAnswer === question.correctAnswer) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const now = new Date();

        // Create quiz assignment with LOCK (create-only, never update to protect score)
        // Pre-check above ensures this only runs for first attempt
        // Create or Update quiz assignment
        // If an unlocked attempt exists (from a revert/retake grant), update it.
        // Otherwise create new.
        let attempt;
        if (existingAttempt) {
            console.log(`[QUIZ_ATTEMPT_POST] Updating existing unlocked attempt ${existingAttempt.id}`);
            attempt = await prisma.quizAssignment.update({
                where: { id: existingAttempt.id },
                data: {
                    status: "completed",
                    isLocked: true, // LOCK immediately on completion
                    score,
                    answers: JSON.stringify(answers),
                    // attemptedAt: now, // Keep original attempt time? Or update? Let's update submittedAt
                    submittedAt: now,
                    completedAt: now
                }
            });
        } else {
            console.log(`[QUIZ_ATTEMPT_POST] Creating new attempt`);
            attempt = await prisma.quizAssignment.create({
                data: {
                    userId,
                    quizId,
                    status: "completed",
                    isLocked: true, // LOCK immediately on creation
                    score,
                    answers: JSON.stringify(answers),
                    attemptedAt: now,
                    submittedAt: now,
                    completedAt: now
                }
            });
        }

        console.log(`[QUIZ_ATTEMPT_POST] ✅ Quiz completed and locked: user ${userId}, quiz ${quizId}, score ${score}%`);

        // If this is a final exam, update enrollment with predicate
        if (quiz.isFinalQuiz === true) {
            console.log(`[QUIZ_ATTEMPT_POST] Detected final exam completion (isFinalQuiz=true), updating enrollment...`);

            // Calculate predicate
            const { calculatePredicate } = await import("@/lib/utils/predicate");
            const predicate = calculatePredicate(score);

            // Find the course this quiz belongs to
            const lesson = await prisma.lesson.findFirst({
                where: {
                    quizId: quizId
                },
                include: {
                    module: true
                }
            });

            if (lesson?.module?.courseId) {
                const courseId = lesson.module.courseId;

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

                console.log(`[QUIZ_ATTEMPT_POST] ✅ Enrollment updated with finalScore: ${score}, finalPredicate: ${predicate}`);
            }
        }


        return NextResponse.json({
            id: attempt.id,
            status: attempt.status,
            score: attempt.score,
            completedAt: attempt.completedAt,
            isLocked: attempt.isLocked
        });
    } catch (error) {
        console.error("[QUIZ_ATTEMPT_POST] ❌ DETAILED ERROR:");
        console.error("Error name:", (error as any)?.name);
        console.error("Error message:", (error as any)?.message);
        console.error("Error stack:", (error as any)?.stack);
        console.error("Full error object:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
