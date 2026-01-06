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

        const { id } = await params;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        if (!quiz) {
            return new NextResponse("Quiz not found", { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("[QUIZ_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
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

        const quiz = await prisma.quiz.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("[QUIZ_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        await prisma.quiz.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[QUIZ_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
