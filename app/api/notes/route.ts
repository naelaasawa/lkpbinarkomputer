
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { lessonId, content } = await req.json();

        if (!lessonId) {
            return new NextResponse("Lesson ID required", { status: 400 });
        }

        const note = await prisma.note.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId,
                }
            },
            update: {
                content,
            },
            create: {
                userId: user.id,
                lessonId,
                content: content || "",
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error("[NOTE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get("lessonId");

        if (!lessonId) {
            return new NextResponse("Lesson ID required", { status: 400 });
        }

        const note = await prisma.note.findUnique({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId,
                }
            }
        });

        return NextResponse.json(note || { content: "" });
    } catch (error) {
        console.error("[NOTE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
