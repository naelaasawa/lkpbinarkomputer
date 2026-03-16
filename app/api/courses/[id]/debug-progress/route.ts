import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const courseId = params.id;

        // Get course with all modules and lessons
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all completed lessons for this user and course
        const completedLessons = await prisma.userProgress.findMany({
            where: {
                userId: user.id,
                lesson: {
                    module: {
                        courseId: courseId
                    }
                }
            },
            select: {
                lessonId: true,
                createdAt: true
            }
        });

        const completedLessonIds = new Set(completedLessons.map(l => l.lessonId));

        // Build detailed report
        const report = {
            courseId: course.id,
            courseTitle: course.title,
            totalLessons: 0,
            completedCount: completedLessons.length,
            modules: [] as any[]
        };

        for (const module of course.modules) {
            const moduleData = {
                moduleId: module.id,
                moduleTitle: module.title,
                lessons: [] as any[]
            };

            for (const lesson of module.lessons) {
                report.totalLessons++;
                const isCompleted = completedLessonIds.has(lesson.id);

                moduleData.lessons.push({
                    lessonId: lesson.id,
                    lessonTitle: lesson.title,
                    contentType: lesson.contentType,
                    order: lesson.order,
                    completed: isCompleted,
                    completedAt: isCompleted
                        ? completedLessons.find((l: { lessonId: string; createdAt: Date }) => l.lessonId === lesson.id)?.createdAt
                        : null
                });
            }

            report.modules.push(moduleData);
        }

        // Calculate progress
        const progressPercentage = Math.round((report.completedCount / report.totalLessons) * 100);

        return NextResponse.json({
            ...report,
            progressPercentage,
            uncompletedLessons: report.modules
                .flatMap((m: { lessons: any[] }) => m.lessons)
                .filter((l: { completed: boolean }) => !l.completed)
        });

    } catch (error) {
        console.error('Error in debug-progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
