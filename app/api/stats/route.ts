import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const coursesCount = await prisma.course.count();
        const studentsCount = await prisma.user.count({
            where: { role: "USER" }
        });
        const enrollmentsCount = await prisma.enrollment.count();

        // Calculate estimated revenue (naive: sum of course prices for all enrollments)
        // This is expensive if we do it naively. Let's just return 0 for now or sum properly if dataset is small.
        // For now, let's just return counts.

        return NextResponse.json({
            coursesCount,
            studentsCount,
            enrollmentsCount,
        });
    } catch (error) {
        console.error("[STATS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
