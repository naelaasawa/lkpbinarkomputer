
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const admins = await prisma.user.findMany({
            where: {
                role: "ADMIN"
            },
            take: 5,
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(admins);
    } catch (error) {
        console.error("[ADMINS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
