
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

        const whereClause: any = {
            isCompleted: true
        };

        if (query) {
            whereClause.OR = [
                { user: { email: { contains: query } } },
                { lesson: { title: { contains: query } } },
                { lesson: { module: { course: { title: { contains: query } } } } }
            ];
        }

        const progress = await prisma.userProgress.findMany({
            take: take === -1 ? undefined : take,
            orderBy: {
                updatedAt: "desc"
            },
            where: whereClause,
            include: {
                user: {
                    select: {
                        email: true
                    }
                },
                lesson: {
                    select: {
                        title: true,
                        module: {
                            select: {
                                course: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Flatten the structure for easier consumption if needed, but UI can handle it.
        return NextResponse.json(progress);
    } catch (error) {
        console.error("[ADMIN_PROGRESS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
