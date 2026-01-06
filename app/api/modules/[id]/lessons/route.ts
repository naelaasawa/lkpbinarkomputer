import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;
        const { title, contentType } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownModule = await prisma.module.findUnique({
            where: {
                id: id,
                // course: { userId }, // Enable ownership check
            },
        });

        if (!ownModule) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lastLesson = await prisma.lesson.findFirst({
            where: {
                moduleId: id,
            },
            orderBy: {
                order: "desc",
            },
        });

        const newOrder = lastLesson ? lastLesson.order + 1 : 1;

        const lesson = await prisma.lesson.create({
            data: {
                title,
                contentType,
                moduleId: id,
                order: newOrder,
                content: contentType === 'text' ? '' : undefined,
            },
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
