import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Direct fix endpoint for a specific course enrollment
export async function POST(
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
            return new NextResponse("User not found", { status: 404 });
        }

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
                        userId: loggedInUser.id,
                        status: 'completed'
                    }
                }
            }
        });

        if (!finalQuiz || !finalQuiz.assignments[0]) {
            return NextResponse.json({
                success: false,
                error: "No completed final quiz found for this course"
            });
        }

        const assignment = finalQuiz.assignments[0];
        const score = assignment.score ?? 0;

        // Calculate predicate
        let predicate = "Kurang";
        if (score >= 90) predicate = "Sangat Memuaskan";
        else if (score >= 80) predicate = "Memuaskan";
        else if (score >= 70) predicate = "Cukup";

        // Update enrollment
        const enrollment = await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId: loggedInUser.id,
                    courseId: courseId
                }
            },
            data: {
                finalScore: score,
                finalPredicate: predicate
            }
        });

        return NextResponse.json({
            success: true,
            message: "Enrollment updated successfully",
            data: {
                courseId,
                userId: loggedInUser.id,
                finalScore: score,
                finalPredicate: predicate,
                enrollment
            }
        });

    } catch (error) {
        console.error("[FIX_COURSE_ENROLLMENT]", error);
        return new NextResponse(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
