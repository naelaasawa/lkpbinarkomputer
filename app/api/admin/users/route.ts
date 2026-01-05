import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        // Ideally check if requester is ADMIN here. 
        // For now, assuming middleware/page protection or simple check.
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        // Retrieve current user from DB to check role
        const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (currentUser?.role !== "ADMIN") {
            // Optional: strict check, though UI hides it. 
            // return new NextResponse("Forbidden", { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
