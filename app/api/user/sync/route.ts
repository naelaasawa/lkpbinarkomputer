import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { userId: clerkId } = await auth();
        const clerkUser = await currentUser();

        if (!clerkId || !clerkUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Upsert user: create if doesn't exist, update if exists
        const user = await prisma.user.upsert({
            where: {
                clerkId,
            },
            update: {
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
            },
            create: {
                clerkId,
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
            },
        }).catch(async (e) => {
            // Handle race condition where user was created between check and insert
            if (e.code === 'P2002') {
                return await prisma.user.findUniqueOrThrow({
                    where: { clerkId }
                });
            }
            throw e;
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_SYNC]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
