import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        // Ideally checking for admin role here
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
