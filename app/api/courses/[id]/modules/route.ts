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

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title } = await req.json();

        const courseOwner = await prisma.course.findUnique({
            where: {
                id: id,
                // userId: userId, // Enable if user ownership is enforced
            },
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lastModule = await prisma.module.findFirst({
            where: {
                courseId: id,
            },
            orderBy: {
                order: "desc",
            },
        });

        const newOrder = lastModule ? lastModule.order + 1 : 1;

        const module = await prisma.module.create({
            data: {
                title,
                courseId: id,
                order: newOrder,
                description: "",
            },
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error("[MODULES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
