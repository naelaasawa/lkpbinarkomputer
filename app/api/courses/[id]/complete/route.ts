import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id: courseId } = await params;
        const body = await req.json();
        const finalQuizScore = body.finalQuizScore as number | undefined;

        // Calculate predicate if score is provided
        let predicate: string | null = null;
        if (finalQuizScore !== undefined) {
            const { calculatePredicate } = await import("@/lib/utils/predicate");
            predicate = calculatePredicate(finalQuizScore);
        }

        // Find or create enrollment
        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            },
            create: {
                userId,
                courseId,
                courseCompleted: true,
                courseCompletedAt: new Date(),
                finalScore: finalQuizScore,
                finalPredicate: predicate
            },
            update: {
                courseCompleted: true,
                courseCompletedAt: new Date(),
                finalScore: finalQuizScore,
                finalPredicate: predicate
            }
        });

        return NextResponse.json({
            success: true,
            completed: true,
            completedAt: enrollment.courseCompletedAt,
            finalScore: enrollment.finalScore,
            finalPredicate: enrollment.finalPredicate,
            certificateAvailable: predicate !== null
        });
    } catch (error) {
        console.error("[COURSE_COMPLETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
