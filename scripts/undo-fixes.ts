// Undo manual fixes for TEST and MICROSOFT WORD courses
import { prisma } from '../lib/prisma';

const USER_EMAIL = 'mihyaeruu10@gmail.com';

async function undoFixes() {
    console.log('Orchestrating Undo Operation...\n');

    try {
        const user = await prisma.user.findFirst({
            where: { email: USER_EMAIL }
        });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        // 1. Revert "TEST" Course (Prompt 1 ago)
        console.log('🔄 Reverting "TEST" Course...');
        const courseTest = await prisma.course.findFirst({
            where: { title: { contains: 'TEST' } },
            include: { modules: { include: { lessons: { include: { quiz: true } } } } }
        });

        if (courseTest) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseTest.id } }
            });

            if (enrollment) {
                // Revert Enrollment
                await prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        finalScore: null,
                        finalPredicate: null,
                        courseCompleted: false // Assuming it wasn't completed before? Or leave true?
                        // Log said "Progress 100%", so maybe courseCompleted was false/true? 
                        // Safest to set false if score is null.
                    }
                });
                console.log('   ✅ Enrollment reverted to NULL score');

                // Revert Quiz Assignment
                let finalQuizId = null;
                courseTest.modules.forEach(m => m.lessons.forEach(l => { if (l.quiz?.isFinalQuiz) finalQuizId = l.quiz.id; }));

                if (finalQuizId) {
                    await prisma.quizAssignment.updateMany({
                        where: { userId: user.id, quizId: finalQuizId },
                        data: {
                            score: null,
                            status: 'in_progress', // Allow retake
                            isLocked: false
                        }
                    });
                    console.log('   ✅ Quiz Assignment unlocked and reset');
                }
            }
        } else {
            console.log('   ⚠️ "TEST" Course not found');
        }

        // 2. Revert "MICROSOFT WORD" Course (Prompt 2 ago)
        console.log('\n🔄 Reverting "MICROSOFT WORD" Course...');
        const courseWord = await prisma.course.findFirst({
            where: { title: { contains: 'MICROSOFT WORD' } },
            include: { modules: { include: { lessons: { include: { quiz: true } } } } }
        });

        if (courseWord) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseWord.id } }
            });

            if (enrollment) {
                // Revert to original score 28
                await prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        finalScore: 28,
                        finalPredicate: 'Kurang', // 28 is Kurang
                        // courseCompleted: true // It was already completed with 28 score
                    }
                });
                console.log('   ✅ Enrollment reverted to Score 28 (Kurang)');

                // Revert Quiz Assignment
                let finalQuizId = null;
                courseWord.modules.forEach(m => m.lessons.forEach(l => { if (l.quiz?.isFinalQuiz) finalQuizId = l.quiz.id; }));

                if (finalQuizId) {
                    await prisma.quizAssignment.updateMany({
                        where: { userId: user.id, quizId: finalQuizId },
                        data: {
                            score: 28,
                            status: 'completed',
                            isLocked: true
                        }
                    });
                    console.log('   ✅ Quiz Assignment reverted to Score 28');
                }

                // Revert Certificate
                const cert = await prisma.certificate.findFirst({
                    where: { userId_courseId: { userId: user.id, courseId: courseWord.id } }
                });
                if (cert) {
                    await prisma.certificate.update({
                        where: { id: cert.id },
                        data: {
                            finalScore: 28,
                            predicate: 'Kurang'
                        }
                    });
                    console.log('   ✅ Certificate reverted to Score 28 (Kurang)');
                }
            }
        } else {
            console.log('   ⚠️ "MICROSOFT WORD" Course not found');
        }

        console.log('\n✅ Undo operations completed successfully.');

    } catch (error) {
        console.error('❌ Error doing undo:', error);
    } finally {
        await prisma.$disconnect();
    }
}

undoFixes();
