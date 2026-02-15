import { prisma } from '../lib/prisma';

async function setFinalQuiz() {
    try {
        console.log('=== SETTING FINAL QUIZ FOR ALL COURSES ===\n');

        // Get all courses with their quizzes
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            where: {
                                contentType: 'quiz'
                            },
                            include: {
                                quiz: true
                            },
                            orderBy: {
                                order: 'desc'
                            }
                        }
                    },
                    orderBy: {
                        order: 'desc'
                    }
                }
            }
        });

        console.log(`Found ${courses.length} courses\n`);

        for (const course of courses) {
            console.log(`📚 Course: ${course.title}`);

            // Find the last quiz in the last module
            const lastModule = course.modules[0];

            if (!lastModule) {
                console.log(`   ⚠️  No modules found\n`);
                continue;
            }

            const lastQuizLesson = lastModule.lessons[0];

            if (!lastQuizLesson || !lastQuizLesson.quiz) {
                console.log(`   ⚠️  No quiz found in last module\n`);
                continue;
            }

            const quiz = lastQuizLesson.quiz;

            // Reset all other quizzes in this course
            const allQuizzesInCourse = course.modules.flatMap(m =>
                m.lessons.filter(l => l.quiz).map(l => l.quiz!.id)
            );

            // Reset all quizzes
            await prisma.quiz.updateMany({
                where: {
                    id: {
                        in: allQuizzesInCourse
                    }
                },
                data: {
                    isFinalQuiz: false
                }
            });

            // Set last quiz as final
            await prisma.quiz.update({
                where: {
                    id: quiz.id
                },
                data: {
                    isFinalQuiz: true
                }
            });

            console.log(`   ✅ Set "${quiz.title}" as FINAL QUIZ`);
            console.log(`      Quiz ID: ${quiz.id}\n`);
        }

        console.log('✅ Done!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setFinalQuiz();
