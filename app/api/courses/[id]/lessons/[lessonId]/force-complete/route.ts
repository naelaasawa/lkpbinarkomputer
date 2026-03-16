import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Force mark a quiz lesson as complete
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; lessonId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const courseId = params.id;
        const lessonId = params.lessonId;

        console.log('[Force Complete] Course:', courseId, 'Lesson:', lessonId);

        // Get user
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify lesson belongs to this course
        const lesson = await prisma.lesson.findFirst({
            where: {
                id: lessonId,
                module: {
                    courseId: courseId
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found in this course' }, { status: 404 });
        }

        // Check if already completed
        const existing = await prisma.userProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId
                }
            }
        });

        if (existing) {
            console.log('[Force Complete] Already exists:', existing);
            return NextResponse.json({
                message: 'Already completed',
                progress: existing
            });
        }

        // Force create completion
        const progress = await prisma.userProgress.create({
            data: {
                userId: user.id,
                lessonId: lessonId,
                isCompleted: true
            }
        });

        console.log('[Force Complete] ✅ Created:', progress);

        return NextResponse.json({
            success: true,
            message: 'Lesson marked as complete',
            progress
        });

    } catch (error) {
        console.error('Error forcing lesson complete:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
