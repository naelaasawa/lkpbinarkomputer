
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
        const categoryId = searchParams.get("categoryId");

        const take = limit ? parseInt(limit) : undefined;

        const whereClause: any = {};
        if (query) {
            whereClause.OR = [
                { title: { contains: query } },
                { description: { contains: query } }
            ];
        }
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const courses = await prisma.course.findMany({
            take: take,
            where: whereClause,
            include: {
                category: true,
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true,
                        modules: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const serializedCourses = courses.map(course => ({
            ...course,
            price: Number(course.price),
        }));

        return NextResponse.json(serializedCourses);
    } catch (error) {
        console.error("[ADMIN_COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
