// Diagnostic script to check enrollment data for certificate claim issues
import { prisma } from '../lib/prisma';

async function diagnoseEnrollment() {
    console.log('🔍 Certificate Claim Diagnostic\n');

    try {
        // Get all enrollments with 100% progress
        const enrollments = await prisma.enrollment.findMany({
            where: {
                progress: 100
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        clerkId: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        console.log(`Found ${enrollments.length} completed enrollments\n`);

        for (const enrollment of enrollments) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📚 Course: ${enrollment.course.title}`);
            console.log(`👤 User: ${enrollment.user.email}`);
            console.log(`🆔 User DB ID: ${enrollment.user.id}`);
            console.log(`🔑 Clerk ID: ${enrollment.user.clerkId}`);
            console.log('\n📊 Enrollment Status:');
            console.log(`   Progress: ${enrollment.progress}%`);
            console.log(`   Course Completed: ${enrollment.courseCompleted}`);
            console.log(`   Completed At: ${enrollment.courseCompletedAt || 'NULL'}`);
            console.log(`   Final Score: ${enrollment.finalScore || 'NULL'}`);
            console.log(`   Final Predicate: ${enrollment.finalPredicate || 'NULL'}`);

            // Check if final quiz exists for this course
            const finalQuiz = await prisma.quiz.findFirst({
                where: {
                    isFinalQuiz: true,
                    lessons: {
                        some: {
                            module: {
                                courseId: enrollment.course.id
                            }
                        }
                    }
                },
                select: {
                    id: true,
                    title: true
                }
            });

            if (finalQuiz) {
                console.log(`\n📝 Final Quiz: ${finalQuiz.title} (ID: ${finalQuiz.id})`);

                // Check if user has taken this quiz
                const quizAssignment = await prisma.quizAssignment.findUnique({
                    where: {
                        userId_quizId: {
                            userId: enrollment.user.id,
                            quizId: finalQuiz.id
                        }
                    }
                });

                if (quizAssignment) {
                    console.log('   ✅ Quiz Assignment Found:');
                    console.log(`      Status: ${quizAssignment.status}`);
                    console.log(`      Score: ${quizAssignment.score || 'NULL'}`);
                    console.log(`      Locked: ${quizAssignment.isLocked}`);
                    console.log(`      Completed At: ${quizAssignment.completedAt || 'NULL'}`);
                } else {
                    console.log('   ⚠️  No Quiz Assignment Found');
                }
            } else {
                console.log('\n⚠️  No Final Quiz configured for this course');
            }

            // Certificate claim ready status
            const canClaimCertificate = enrollment.finalPredicate !== null;
            console.log(`\n🎓 Certificate Claim Status: ${canClaimCertificate ? '✅ READY' : '❌ NOT READY'}`);

            if (!canClaimCertificate) {
                console.log('\n🛠️  TO FIX:');
                if (!finalQuiz) {
                    console.log('   1. Set isFinalQuiz=true for the last quiz in this course');
                } else {
                    console.log('   1. User needs to complete the final quiz');
                    console.log('   2. OR run backfill script to calculate predicate from existing score');
                }
            }

            console.log('');
        }

    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseEnrollment();
