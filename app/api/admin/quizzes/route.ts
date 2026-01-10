
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        // Basic admin check (can be extracted to middleware/util)
        const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (currentUser?.role !== "ADMIN") {
            // return new NextResponse("Forbidden", { status: 403 });
        }

        const quizzes = await prisma.quiz.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        assignments: true
                    }
                }
            }
        });

        return NextResponse.json(quizzes);
    } catch (error) {
        console.error("[ADMIN_QUIZZES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
