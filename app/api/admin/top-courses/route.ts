
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get("limit");
        const query = searchParams.get("query");

        const take = limit ? parseInt(limit) : 5;

        const whereClause: any = {};
        if (query) {
            whereClause.title = {
                contains: query
            };
        }

        const courses = await prisma.course.findMany({
            take: take === -1 ? undefined : take,
            where: whereClause,
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true
                    }
                },
                // Include reviews to calculate average rating if needed?
                // Or just trust the count for now.
                // Maybe include category for display.
                category: true
            },
            orderBy: {
                enrollments: {
                    _count: 'desc'
                }
            }
        });

        // Calculate average rating for each (if needed, but might be expensive to aggregate manually if not stored)
        // For simple widget, just returning counts is fine.
        // Or fetch reviews to calc average.
        // Let's keep it simple: just counts.

        return NextResponse.json(courses);
    } catch (error) {
        console.error("[TOP_COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
