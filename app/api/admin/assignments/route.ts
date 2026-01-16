
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
                            contains: query
                        }
                    }
                },
                {
                    quiz: {
                        title: {
                            contains: query
                        }
                    }
                }
            ];
        }

        const assignments = await prisma.quizAssignment.findMany({
            take: take === -1 ? undefined : take,
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        email: true,
                    }
                },
                quiz: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("[ADMIN_ASSIGNMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
