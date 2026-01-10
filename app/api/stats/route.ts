import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const coursesCount = await prisma.course.count();
        const studentsCount = await prisma.user.count();
        const enrollmentsCount = await prisma.enrollment.count();

        // Get enrollments for the last 6 months for the chart
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months to include current month = 6 total
        sixMonthsAgo.setDate(1); // Start of that month

        const enrollments = await prisma.enrollment.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                }
            },
            include: {
                course: {
                    select: {
                        price: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Group by month
        const monthlyStats = new Map<string, { name: string, revenue: number, enrollments: number }>();

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyStats.set(monthName, { name: monthName, revenue: 0, enrollments: 0 });
        }

        // Fill data
        enrollments.forEach(enrollment => {
            const monthName = enrollment.createdAt.toLocaleString('default', { month: 'short' });
            if (monthlyStats.has(monthName)) {
                const stat = monthlyStats.get(monthName)!;
                stat.enrollments += 1;
                stat.revenue += Number(enrollment.course.price);
            }
        });

        const graphData = Array.from(monthlyStats.values());

        return NextResponse.json({
            coursesCount,
            studentsCount,
            enrollmentsCount,
            graphData
        });
    } catch (error) {
        console.error("[STATS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
