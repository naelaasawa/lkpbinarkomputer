import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function DebugProgressPage() {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/sign-in");
    }

    // Get user from db
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    });

    if (!user) {
        return <div>User not found in database.</div>;
    }

    // Get all courses
    const courses = await prisma.course.findMany({
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

    // Get user progress
    const userProgress = await prisma.userProgress.findMany({
        where: { userId: user.id }
    });

    const completedLessonIds = new Set(userProgress.map(p => p.lessonId));

    // Calculate missing lessons for each course
    const coursesWithStatus = courses.map(course => {
        const allLessons = course.modules.flatMap(m => m.lessons);
        const totalLessons = allLessons.length;
        const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
        const missingLessons = allLessons.filter(l => !completedLessonIds.has(l.id));

        return {
            ...course,
            totalLessons,
            completedCount,
            progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
            missingLessons
        };
    });

    async function fixLesson(lessonId: string, courseId: string) {
        "use server";

        try {
            const { userId: currentUserId } = await auth();
            if (!currentUserId) return;

            const currentUser = await prisma.user.findUnique({
                where: { clerkId: currentUserId }
            });

            if (!currentUser) return;

            await prisma.userProgress.create({
                data: {
                    userId: currentUser.id,
                    lessonId: lessonId,
                    isCompleted: true
                }
            });

            revalidatePath("/debug-progress");
        } catch (error) {
            console.error("Failed to fix lesson:", error);
        }
    }

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug Course Progress</h1>

            <div className="space-y-8">
                {coursesWithStatus.map(course => (
                    <div key={course.id} className="border p-6 rounded-lg shadow-sm bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{course.title}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${course.progress === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {course.progress}% ({course.completedCount}/{course.totalLessons})
                            </span>
                        </div>

                        {course.missingLessons.length > 0 ? (
                            <div>
                                <h3 className="font-medium mb-2 text-red-600">Missing Lessons ({course.missingLessons.length}):</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded">
                                    {course.missingLessons.map(lesson => (
                                        <div key={lesson.id} className="flex justify-between items-center p-2 hover:bg-slate-50 border-b last:border-0">
                                            <div className="text-sm">
                                                <span className="font-mono text-xs text-slate-500 mr-2">[{lesson.contentType}]</span>
                                                {lesson.title}
                                            </div>
                                            <form action={fixLesson.bind(null, lesson.id, course.id)}>
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                                >
                                                    Fix / Mark Complete
                                                </button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-green-600 font-medium">✅ All lessons completed!</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
