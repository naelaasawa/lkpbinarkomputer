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

        const { id: courseId } = await params;

        // Check if enrollment exists and is completed
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            },
            select: {
                courseCompleted: true,
                courseCompletedAt: true,
                finalScore: true,
                finalPredicate: true
            }
        });

        if (!enrollment) {
            return NextResponse.json({
                completed: false,
                completedAt: null,
                finalScore: null,
                finalPredicate: null
            });
        }

        return NextResponse.json({
            completed: enrollment.courseCompleted,
            completedAt: enrollment.courseCompletedAt,
            finalScore: enrollment.finalScore,
            finalPredicate: enrollment.finalPredicate
        });
    } catch (error) {
        console.error("[COURSE_COMPLETION_STATUS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
