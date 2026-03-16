// Script to backfill finalPredicate for existing completions
import { prisma } from '../lib/prisma';

async function backfillPredicates() {
    console.log('🔄 Backfilling finalPredicate for existing enrollments...\n');

    try {
        // Find all enrollments that are 100% complete but don't have finalPredicate
        const completedEnrollments = await prisma.enrollment.findMany({
            where: {
                progress: 100,
                finalPredicate: null
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        modules: {
                            include: {
                                lessons: {
                                    where: {
                                        quiz: {
                                            isFinalQuiz: true
                                        }
                                    },
                                    include: {
                                        quiz: true
                                    }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        console.log(`Found ${completedEnrollments.length} enrollments to backfill\n`);

        for (const enrollment of completedEnrollments) {
            console.log(`Processing: ${enrollment.user.email} - ${enrollment.course.title}`);

            // Find final quiz for this course
            let finalQuizId: string | null = null;
            for (const module of enrollment.course.modules) {
                for (const lesson of module.lessons) {
                    if (lesson.quiz?.isFinalQuiz) {
                        finalQuizId = lesson.quiz.id;
                        break;
                    }
                }
                if (finalQuizId) break;
            }

            if (!finalQuizId) {
                console.log('  ⚠️  No final quiz found for this course, skipping');
                continue;
            }

            // Find quiz assignment for this user
            const quizAssignment = await prisma.quizAssignment.findUnique({
                where: {
                    userId_quizId: {
                        userId: enrollment.user.id,
                        quizId: finalQuizId
                    }
                }
            });

            if (!quizAssignment || quizAssignment.score === null) {
                console.log('  ⚠️  No quiz score found, skipping');
                continue;
            }

            // Calculate predicate
            const score = quizAssignment.score;
            let predicate: string;

            if (score >= 90) {
                predicate = "Sangat Memuaskan";
            } else if (score >= 80) {
                predicate = "Memuaskan";
            } else if (score >= 70) {
                predicate = "Cukup";
            } else {
                predicate = "Kurang";
            }

            // Update enrollment
            await prisma.enrollment.update({
                where: {
                    id: enrollment.id
                },
                data: {
                    finalScore: score,
                    finalPredicate: predicate,
                    courseCompleted: true,
                    courseCompletedAt: quizAssignment.completedAt || new Date()
                }
            });

            console.log(`  ✅ Updated: score=${score}, predicate=${predicate}`);
        }

        console.log('\n✅ Backfill complete!');

    } catch (error) {
        console.error('❌ Backfill failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

backfillPredicates();
