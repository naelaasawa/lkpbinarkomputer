
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { courseId, rating, comment } = await req.json();

        if (!courseId || !rating) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if user has already reviewed the course
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                courseId,
            }
        });

        let review;
        if (existingReview) {
            // Update existing review
            review = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    comment,
                }
            });
        } else {
            // Create new review
            review = await prisma.review.create({
                data: {
                    userId: user.id,
                    courseId,
                    rating,
                    comment,
                }
            });
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error("[REVIEW_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (courseId) {
            // Fetch reviews for specific course
            const reviews = await prisma.review.findMany({
                where: { courseId },
                include: {
                    user: {
                        select: {
                            email: true,
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(reviews);
        }

        // Fetch all reviews (for admin maybe? limited fields)
        // Or if needed for admin page, we might want a separate admin route or verify admin role here.
        // For now, let's keep it simple or return empty if no courseId.

        return new NextResponse("Course ID required", { status: 400 });

    } catch (error) {
        console.error("[REVIEW_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
