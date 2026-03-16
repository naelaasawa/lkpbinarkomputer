// Script to fix existing enrollments with missing finalPredicate
// Run this with: npx tsx scripts/fix-enrollment-predicate.ts

import { prisma } from '../lib/prisma';

function calculatePredicate(score: number): string {
    if (score >= 90) return "Sangat Memuaskan";
    if (score >= 80) return "Memuaskan";
    if (score >= 70) return "Cukup";
    return "Kurang";
}

async function main() {
    console.log('🔍 Searching for completed final quizzes without enrollment predicate...\n');

    // Find all final quizzes
    const finalQuizzes = await prisma.quiz.findMany({
        where: {
            type: 'final_exam'
        },
        include: {
            assignments: {
                where: {
                    status: 'completed'
                },
                include: {
                    user: true
                }
            },
            lessons: {
                include: {
                    module: true
                }
            }
        }
    });

    let fixedCount = 0;

    for (const quiz of finalQuizzes) {
        console.log(`\n📝 Final Quiz: "${quiz.title}"`);

        for (const assignment of quiz.assignments) {
            // Find course ID from lesson
            const lesson = quiz.lessons[0];
            if (!lesson?.module?.courseId) {
                console.log(`  ⚠️  No course found for quiz`);
                continue;
            }

            const courseId = lesson.module.courseId;
            const score = assignment.score ?? 0;
            const predicate = calculatePredicate(score);

            // Check enrollment
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: assignment.userId,
                        courseId: courseId
                    }
                }
            });

            if (!enrollment?.finalPredicate) {
                console.log(`  ✅ Fixing enrollment for user: ${assignment.user.email}`);
                console.log(`     Score: ${score}% → Predicate: ${predicate}`);

                await prisma.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: assignment.userId,
                            courseId: courseId
                        }
                    },
                    create: {
                        userId: assignment.userId,
                        courseId: courseId,
                        finalScore: score,
                        finalPredicate: predicate
                    },
                    update: {
                        finalScore: score,
                        finalPredicate: predicate
                    }
                });

                fixedCount++;
            } else {
                console.log(`  ℹ️  Already has predicate: ${enrollment.finalPredicate}`);
            }
        }
    }

    console.log(`\n✅ Fixed ${fixedCount} enrollment(s)`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
