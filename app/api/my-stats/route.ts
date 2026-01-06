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
            include: {
                enrollments: true,
            },
        });

        if (!user) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        // Calculate real stats from enrollments
        const totalEnrollments = user.enrollments.length;
        const coursesInProgress = user.enrollments.filter((e) => e.progress < 100).length;
        const coursesCompleted = user.enrollments.filter((e) => e.progress === 100).length;

        // Calculate total hours spent (mock: 2 hours per 10% progress per course)
        const totalHoursSpent = user.enrollments.reduce((sum, e) => {
            return sum + Math.floor((e.progress / 10) * 2);
        }, 0);

        // Calculate XP points (100 XP per 1% progress across all courses)
        const totalXP = user.enrollments.reduce((sum, e) => sum + (e.progress * 100), 0);

        const stats = {
            totalEnrollments,
            coursesInProgress,
            certificatesEarned: coursesCompleted,
            hoursSpent: totalHoursSpent,
            xpPoints: totalXP,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("[MY_STATS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
