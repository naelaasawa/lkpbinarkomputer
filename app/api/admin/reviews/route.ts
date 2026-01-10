
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify admin
        // Fetch user role
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user || user.role !== "ADMIN") { // Assuming "ADMIN" is the role string
            return new NextResponse("Forbidden", { status: 403 });
        }

        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                    }
                },
                course: {
                    select: {
                        title: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(reviews);

    } catch (error) {
        console.error("[ADMIN_REVIEWS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
