import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        const { id: courseId } = await params;

        console.log('[ENROLL] Clerk ID:', clerkId);
        console.log('[ENROLL] Course ID:', courseId);

        if (!clerkId) {
            console.error('[ENROLL] No Clerk ID - user not authenticated');
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Get User ID from DB
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        console.log('[ENROLL] User found:', user ? `Yes (ID: ${user.id})` : 'No');

        if (!user) {
            console.error('[ENROLL] User not found in DB for clerkId:', clerkId);
            return new NextResponse("User not found - please refresh the page", { status: 404 });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
        });

        console.log('[ENROLL] Existing enrollment:', existingEnrollment ? 'Yes' : 'No');

        if (existingEnrollment) {
            console.log('[ENROLL] User already enrolled');
            return new NextResponse("Already enrolled", { status: 400 });
        }

        // 3. Create Enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId,
                progress: 0,
            },
        });

        console.log('[ENROLL] Enrollment created successfully:', enrollment.id);
        return NextResponse.json(enrollment);
    } catch (error) {
        console.error("[COURSE_ENROLL] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

