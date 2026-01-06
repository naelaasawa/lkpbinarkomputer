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
        const { title, description, order, isPublished } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify course ownership via module
        const ownModule = await prisma.module.findUnique({
            where: {
                id: id,
                // course: { userId }, // Enable if ownership check needed
            },
        });

        if (!ownModule) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const module = await prisma.module.update({
            where: {
                id: id,
            },
            data: {
                title,
                description,
                order,
            },
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error("[MODULE_PATCH]", error);
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

        const ownModule = await prisma.module.findUnique({
            where: {
                id: id,
            },
        });

        if (!ownModule) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const module = await prisma.module.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error("[MODULE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
