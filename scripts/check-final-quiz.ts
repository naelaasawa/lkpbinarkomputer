import { prisma } from '../lib/prisma';

async function checkFinalQuiz() {
    try {
        console.log('=== CHECKING FINAL QUIZ CONFIGURATION ===\n');

        // Get all quizzes
        const allQuizzes = await prisma.quiz.findMany({
            select: {
                id: true,
                title: true,
                isFinalQuiz: true,
                lessons: {
                    select: {
                        module: {
                            select: {
                                courseId: true,
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

        console.log(`Total quizzes: ${allQuizzes.length}\n`);

        // Group by course
        const quizzesByCourse = allQuizzes.reduce((acc: any, quiz) => {
            if (quiz.lessons[0]?.module) {
                const courseId = quiz.lessons[0].module.courseId;
                const courseTitle = quiz.lessons[0].module.course.title;
                if (!acc[courseId]) {
                    acc[courseId] = {
                        courseTitle,
                        quizzes: []
                    };
                }
                acc[courseId].quizzes.push({
                    id: quiz.id,
                    title: quiz.title,
                    isFinalQuiz: quiz.isFinalQuiz
                });
            }
            return acc;
        }, {});

        // Display results
        for (const [courseId, data] of Object.entries<any>(quizzesByCourse)) {
            console.log(`📚 Course: ${data.courseTitle}`);
            console.log(`   Course ID: ${courseId}`);
            console.log(`   Quizzes (${data.quizzes.length}):`);

            data.quizzes.forEach((quiz: any, index: number) => {
                const marker = quiz.isFinalQuiz ? '🏆 FINAL QUIZ' : '📝';
                console.log(`   ${index + 1}. ${marker} ${quiz.title}`);
                console.log(`      ID: ${quiz.id}`);
            });
            console.log('');
        }

        // Find courses without final quiz
        const coursesWithoutFinal = Object.entries<any>(quizzesByCourse).filter(
            ([_, data]) => !data.quizzes.some((q: any) => q.isFinalQuiz)
        );

        if (coursesWithoutFinal.length > 0) {
            console.log('\n⚠️  COURSES WITHOUT FINAL QUIZ:');
            coursesWithoutFinal.forEach(([courseId, data]) => {
                console.log(`   - ${data.courseTitle} (${courseId})`);
                if (data.quizzes.length > 0) {
                    console.log(`     Suggested: Set "${data.quizzes[data.quizzes.length - 1].title}" as final quiz`);
                }
            });
        } else {
            console.log('\n✅ All courses have final quiz configured');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFinalQuiz();
