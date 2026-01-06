import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const quizzes = await prisma.quiz.findMany({
            include: {
                _count: {
                    select: { questions: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(quizzes);
    } catch (error) {
        console.error("[QUIZZES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, type, timeLimit, attemptLimit, passingScore, randomize } = body;

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                type: type || "practice",
                timeLimit,
                attemptLimit,
                passingScore: passingScore || 70,
                randomize: randomize || false,
                status: "draft",
            },
        });

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("[QUIZZES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
