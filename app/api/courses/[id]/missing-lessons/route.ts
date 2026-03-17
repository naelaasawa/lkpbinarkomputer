import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get MISSING lessons (lessons that exist in course but not in user progress)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: courseId } = await params;

        // Get user
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get ALL lessons in this course
        const allLessons = await prisma.lesson.findMany({
            where: {
                module: {
                    courseId: courseId
                }
            },
            select: {
                id: true,
                title: true,
                contentType: true,
                order: true,
                module: {
                    select: {
                        title: true,
                        order: true
                    }
                }
            },
            orderBy: [
                { module: { order: 'asc' } },
                { order: 'asc' }
            ]
        });

        // Get completed lesson IDs
        const completed = await prisma.userProgress.findMany({
            where: {
                userId: user.id,
                lesson: {
                    module: {
                        courseId: courseId
                    }
                }
            },
            select: {
                lessonId: true
            }
        });

        const completedIds = new Set(completed.map(c => c.lessonId));

        // Find missing lessons
        const missingLessons = allLessons
            .filter(lesson => !completedIds.has(lesson.id))
            .map(lesson => ({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                contentType: lesson.contentType,
                moduleTitle: lesson.module.title,
                moduleOrder: lesson.module.order,
                lessonOrder: lesson.order
            }));

        return NextResponse.json({
            totalLessons: allLessons.length,
            completedLessons: completed.length,
            missingLessons: missingLessons,
            progressPercent: Math.round((completed.length / allLessons.length) * 100)
        });

    } catch (error) {
        console.error('Error finding missing lessons:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
