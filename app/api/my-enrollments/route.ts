import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Find user in Prisma database
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return new NextResponse("User not found in database. Please refresh.", { status: 404 });
        }

        // Fetch user's enrollments with course and category details
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: user.id,
            },
            include: {
                course: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        // Serialize Decimal to number for JSON response
        const serializedEnrollments = enrollments.map((enrollment) => ({
            ...enrollment,
            course: {
                ...enrollment.course,
                price: Number(enrollment.course.price),
            },
        }));

        return NextResponse.json(serializedEnrollments);
    } catch (error) {
        console.error("[MY_ENROLLMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
