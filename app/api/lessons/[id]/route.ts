import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;
        const { title, contentType, content, duration, order, isPublished } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownLesson = await prisma.lesson.findUnique({
            where: {
                id: id,
            },
        });

        if (!ownLesson) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lesson = await prisma.lesson.update({
            where: {
                id: id,
            },
            data: {
                title,
                contentType,
                content,
                duration,
                order,
            },
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSON_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownLesson = await prisma.lesson.findUnique({
            where: {
                id: id,
            },
        });

        if (!ownLesson) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lesson = await prisma.lesson.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSON_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
