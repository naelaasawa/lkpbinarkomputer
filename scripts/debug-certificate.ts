import { prisma } from '../lib/prisma';

async function debugCertificate() {
    try {
        console.log('=== DEBUGGING CERTIFICATE ACCESS ===\n');

        // Step 1: Check all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                clerkId: true
            }
        });

        console.log(`📊 Total Users: ${users.length}\n`);

        for (const user of users) {
            console.log(`\n👤 User: ${user.email}`);
            console.log(`   User ID: ${user.id}`);

            // Check enrollments
            const enrollments = await prisma.enrollment.findMany({
                where: { userId: user.id },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            console.log(`   Enrollments: ${enrollments.length}`);

            for (const enrollment of enrollments) {
                console.log(`\n   📚 Course: ${enrollment.course.title}`);
                console.log(`      Progress: ${enrollment.progress}%`);
                console.log(`      Final Predicate: ${enrollment.finalPredicate || 'NOT SET'}`);
                console.log(`      Final Score: ${enrollment.finalScore || 'NOT SET'}`);

                // Find final quiz for this course
                const finalQuiz = await prisma.quiz.findFirst({
                    where: {
                        isFinalQuiz: true,
                        lessons: {
                            some: {
                                module: {
                                    courseId: enrollment.courseId
                                }
                            }
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        isFinalQuiz: true
                    }
                });

                if (finalQuiz) {
                    console.log(`      🏆 Final Quiz: ${finalQuiz.title} (${finalQuiz.id})`);

                    // Check user's attempt
                    const attempt = await prisma.quizAssignment.findUnique({
                        where: {
                            userId_quizId: {
                                userId: user.id,
                                quizId: finalQuiz.id
                            }
                        },
                        select: {
                            status: true,
                            score: true,
                            isLocked: true,
                            completedAt: true
                        }
                    });

                    if (attempt) {
                        console.log(`      ✅ Quiz Attempt EXISTS`);
                        console.log(`         Status: ${attempt.status}`);
                        console.log(`         Score: ${attempt.score}%`);
                        console.log(`         Locked: ${attempt.isLocked}`);
                        console.log(`         Completed: ${attempt.completedAt}`);

                        if (attempt.status === 'completed') {
                            console.log(`      🎓 CERTIFICATE SHOULD BE AVAILABLE!`);
                        } else {
                            console.log(`      ⚠️  Quiz not completed yet`);
                        }
                    } else {
                        console.log(`      ❌ NO Quiz Attempt found`);
                        console.log(`      ⚠️  User needs to complete final quiz`);
                    }
                } else {
                    console.log(`      ❌ NO Final Quiz configured for this course!`);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugCertificate();
