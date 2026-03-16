// Quick check for quizzes in the specific course
import { prisma } from '../lib/prisma';

async function checkCourseQuizzes() {
    const courseId = '0cdf8abc-8e01-4571-ba4f-5ee05647fce0';
    const userId = '3622ec89-5c60-4038-9710-2904d9657ef5';

    console.log('🔍 Checking course quizzes...\n');

    try {
        // Get course info
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true }
        });

        console.log(`📚 Course: ${course?.title}\n`);

        // Get all quizzes for this course
        const quizzes = await prisma.quiz.findMany({
            where: {
                lessons: {
                    some: {
                        module: {
                            courseId: courseId
                        }
                    }
                }
            },
            select: {
                id: true,
                title: true,
                isFinalQuiz: true,
                type: true,
                passingScore: true
            }
        });

        console.log(`Found ${quizzes.length} quiz(es):\n`);

        for (const quiz of quizzes) {
            console.log(`📝 ${quiz.title}`);
            console.log(`   ID: ${quiz.id}`);
            console.log(`   Type: ${quiz.type}`);
            console.log(`   Is Final Quiz: ${quiz.isFinalQuiz ? '✅ YES' : '❌ NO'}`);
            console.log(`   Passing Score: ${quiz.passingScore}`);

            // Check if user has taken this quiz
            const assignment = await prisma.quizAssignment.findUnique({
                where: {
                    userId_quizId: {
                        userId: userId,
                        quizId: quiz.id
                    }
                }
            });

            if (assignment) {
                console.log(`   User Assignment:`);
                console.log(`      Status: ${assignment.status}`);
                console.log(`      Score: ${assignment.score ?? 'NULL'}`);
                console.log(`      Completed: ${assignment.completedAt ?? 'NULL'}`);
            } else {
                console.log(`   User Assignment: ❌ Not taken`);
            }
            console.log('');
        }

        // Recommendation
        const finalQuizCount = quizzes.filter(q => q.isFinalQuiz).length;

        if (finalQuizCount === 0) {
            console.log('⚠️  NO FINAL QUIZ MARKED!');
            console.log('\n🛠️  ACTION REQUIRED:');
            console.log('   1. Choose which quiz should be the final quiz');
            console.log('   2. Mark it as final quiz using this query:\n');
            if (quizzes.length > 0) {
                const lastQuiz = quizzes[quizzes.length - 1];
                console.log(`   UPDATE \`Quiz\` SET isFinalQuiz=1 WHERE id='${lastQuiz.id}';`);
                console.log(`\n   Then re-run the fix script.`);
            }
        } else if (finalQuizCount > 1) {
            console.log('⚠️  MULTIPLE FINAL QUIZZES MARKED!');
            console.log('   Only one quiz should be marked as final.');
        } else {
            console.log('✅ Final quiz is properly configured');
        }

    } catch (error) {
        console.error('❌ Check failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkCourseQuizzes();
