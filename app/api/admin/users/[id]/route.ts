import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (currentUser?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { id } = await params;
        const { role } = await req.json();

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
