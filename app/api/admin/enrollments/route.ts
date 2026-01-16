
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
            whereClause.OR = [
                {
                    user: {
                        email: {
                            contains: query,
                            // mode: "insensitive" // mysql doesn't support mode: insensitive without specific collation usually, but prisma might handle it or just use contains.
                            // However, default mysql contains is case insensitive usually.
                        }
                    }
                },
                {
                    course: {
                        title: {
                            contains: query
                        }
                    }
                }
            ];
        }

        const enrollments = await prisma.enrollment.findMany({
            take: take === -1 ? undefined : take, // -1 means all
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        email: true,
                    }
                },
                course: {
                    select: {
                        title: true,
                        price: true
                    }
                }
            }
        });

        return NextResponse.json(enrollments);
    } catch (error) {
        console.error("[ADMIN_ENROLLMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
