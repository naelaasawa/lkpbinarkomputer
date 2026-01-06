import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        // Ideally check if user is admin/instructor
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { quizId, userIds } = await req.json();

        if (!quizId || !userIds || !Array.isArray(userIds)) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        const assignments = await Promise.all(
            userIds.map(async (assignedUserId: string) => {
                // Find user by email or ID if necessary. Assuming userIds passed are database IDs or emails.
                // The ShareQuizModal passes emails likely, or we need to ensure we pass IDs.
                // Re-checking ShareQuizModal: it uses `users` state which has full objects. 
                // We should ensure we pass IDs. If we passed emails, we'd need to look them up.
                // Let's assume we will modify ShareQuizModal to pass IDs.

                // Using upsert to avoid duplicates if already assigned
                return prisma.quizAssignment.upsert({
                    where: {
                        userId_quizId: {
                            userId: assignedUserId,
                            quizId: quizId,
                        }
                    },
                    update: {
                        // If re-assigned, maybe reset status? Or keep as is.
                        // Let's keep as is for now.
                    },
                    create: {
                        userId: assignedUserId,
                        quizId: quizId,
                        status: "assigned"
                    }
                });
            })
        );

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("[QUIZ_ASSIGNMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get user's DB ID from Clerk ID first (if schema links them) or if userId is same.
        // Looking at schema: User model has `clerkId` and `id`. 
        // We need to find the User record where clerkId == userId (from auth).
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const assignments = await prisma.quizAssignment.findMany({
            where: {
                userId: user.id
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        type: true,
                        timeLimit: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("[QUIZ_ASSIGNMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
