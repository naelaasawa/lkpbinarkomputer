// Revert manual data fixes for TEST and MICROSOFT WORD
import { prisma } from '../lib/prisma';

const USER_EMAIL = 'mihyaeruu10@gmail.com';

async function revertCourseData() {
    console.log('🔄 Reverting Manual Data Fixes...\n');

    try {
        const user = await prisma.user.findFirst({
            where: { email: USER_EMAIL }
        });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }
        console.log(`👤 User: ${user.email}`);

        // 1. Revert "TEST" Course (Prompt -2)
        // Original State: Incomplete / Null score
        console.log('\n--- Reverting "TEST" Course ---');
        const courseTest = await prisma.course.findFirst({
            where: { title: { contains: 'TEST' } },
            include: { modules: { include: { lessons: { include: { quiz: true } } } } }
        });

        if (courseTest) {
            // Revert Enrollment
            await prisma.enrollment.updateMany({
                where: { userId: user.id, courseId: courseTest.id },
                data: {
                    finalScore: null,
                    finalPredicate: null,
                    courseCompleted: false
                }
            });
            console.log('   ✅ Enrollment reverted to NULL score');

            // Find final quiz
            let finalQuizId = null;
            courseTest.modules.forEach(m => m.lessons.forEach(l => {
                if (l.quiz?.isFinalQuiz) finalQuizId = l.quiz.id;
            }));

            if (finalQuizId) {
                // Unlock Quiz Assignment
                await prisma.quizAssignment.updateMany({
                    where: { userId: user.id, quizId: finalQuizId },
                    data: {
                        score: null,
                        status: 'in_progress',
                        isLocked: false,
                        completedAt: null,
                        submittedAt: null
                    }
                });
                console.log('   ✅ Quiz Assignment unlocked and reset');
            }

            // Delete Certificate if exists (since score is now null)
            const deleted = await prisma.certificate.deleteMany({
                where: { userId: user.id, courseId: courseTest.id }
            });
            if (deleted.count > 0) {
                console.log('   ✅ Certificate deleted (invalidated)');
            }
        } else {
            console.log('   ⚠️ "TEST" Course not found');
        }

        // 2. Revert "MICROSOFT WORD" Course (Prompt -3)
        // Original State: Score 28, Predicate 'Kurang'
        console.log('\n--- Reverting "MICROSOFT WORD" Course ---');
        const courseWord = await prisma.course.findFirst({
            where: { title: { contains: 'MICROSOFT WORD' } },
            include: { modules: { include: { lessons: { include: { quiz: true } } } } }
        });

        if (courseWord) {
            // Revert Enrollment
            await prisma.enrollment.updateMany({
                where: { userId: user.id, courseId: courseWord.id },
                data: {
                    finalScore: 28,
                    finalPredicate: 'Kurang', // 28 is Kurang
                    courseCompleted: true
                }
            });
            console.log('   ✅ Enrollment reverted to Score 28 (Kurang)');

            // Find final quiz
            let finalQuizId = null;
            courseWord.modules.forEach(m => m.lessons.forEach(l => {
                if (l.quiz?.isFinalQuiz) finalQuizId = l.quiz.id;
            }));

            if (finalQuizId) {
                // Set Quiz Assignment to 28
                await prisma.quizAssignment.updateMany({
                    where: { userId: user.id, quizId: finalQuizId },
                    data: {
                        score: 28,
                        status: 'completed',
                        isLocked: true
                        // Keep dates as is or update if cleaner
                    }
                });
                console.log('   ✅ Quiz Assignment reverted to Score 28');
            }

            // Update Certificate (to reflect 28/Kurang)
            // Note: certificate might not exist if they hadn't claimed, but if they did:
            const certs = await prisma.certificate.findMany({
                where: { userId: user.id, courseId: courseWord.id }
            });

            for (const cert of certs) {
                await prisma.certificate.update({
                    where: { id: cert.id },
                    data: {
                        finalScore: 28,
                        predicate: 'Kurang'
                    }
                });
                console.log(`   ✅ Certificate ${cert.certificateNumber} reverted to Score 28 (Kurang)`);
            }
        } else {
            console.log('   ⚠️ "MICROSOFT WORD" Course not found');
        }

        console.log('\n✅ REVERT COMPLETE');

    } catch (error) {
        console.error('❌ Error reverting:', error);
    } finally {
        await prisma.$disconnect();
    }
}

revertCourseData();
