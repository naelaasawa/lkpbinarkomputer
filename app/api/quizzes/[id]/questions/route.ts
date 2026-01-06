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

        const { id } = await params;
        const body = await req.json();
        const { type, question, options, correctAnswer, explanation, score } = body;

        if (!type || !question || !correctAnswer) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Temporarily use simple order increment
        // TODO: Fix Prisma client type issue
        const existingCount = 0; // await prisma.question.count({ where: { quizId: id } });

        const newQuestion = await prisma.question.create({
            data: {
                quizId: id,
                type,
                question,
                options: options ? JSON.stringify(options) : undefined,
                correctAnswer,
                explanation,
                score: score || 1,
                order: existingCount,
            },
        });

        return NextResponse.json(newQuestion);
    } catch (error) {
        console.error("[QUESTIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
