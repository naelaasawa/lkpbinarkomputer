import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id, questionId } = await params;
        const body = await req.json();

        // Optional: Ensure question belongs to quiz
        // But since IDs are unique, simple update is fine.

        const updated = await prisma.question.update({
            where: { id: questionId },
            data: {
                ...body,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[QUESTION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { questionId } = await params;

        await prisma.question.delete({
            where: { id: questionId }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[QUESTION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
