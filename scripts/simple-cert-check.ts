import { prisma } from '../lib/prisma';

async function simpleCertCheck() {
    const courseId = process.argv[2];

    if (!courseId) {
        console.log('Usage: npx tsx scripts/simple-cert-check.ts [courseId]');
        process.exit(1);
    }

    try {
        console.log(`\n🔍 Checking Certificate for Course: ${courseId}\n`);

        // 1. Find final quiz
        const finalQuiz = await prisma.quiz.findFirst({
            where: {
                isFinalQuiz: true,
                lessons: {
                    some: {
                        module: {
                            courseId: courseId
                        }
                    }
                }
            }
        });

        console.log('Final Quiz:', finalQuiz ? `✅ ${finalQuiz.title} (${finalQuiz.id})` : '❌ NOT FOUND');

        if (!finalQuiz) {
            console.log('\n⚠️  NO FINAL QUIZ! Run set-final-quiz.ts first.\n');
            process.exit(0);
        }

        // 2. Check all quiz attempts
        const attempts = await prisma.quizAssignment.findMany({
            where: {
                quizId: finalQuiz.id
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        console.log(`\nQuiz Attempts: ${attempts.length}`);

        for (const attempt of attempts) {
            console.log(`\n  👤 ${attempt.user.email}`);
            console.log(`     Status: ${attempt.status}`);
            console.log(`     Score: ${attempt.score}%`);
            console.log(`     ${attempt.status === 'completed' ? '✅ CERTIFICATE AVAILABLE' : '❌ Incomplete'}`);
        }

        console.log('\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

simpleCertCheck();
