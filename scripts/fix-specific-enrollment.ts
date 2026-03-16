// Fix specific enrollment for mihyaeruu10@gmail.com
import { prisma } from '../lib/prisma';

async function fixSpecificEnrollment() {
    const userId = '3622ec89-5c60-4038-9710-2904d9657ef5';
    const courseId = '0cdf8abc-8e01-4571-ba4f-5ee05647fce0';

    console.log('🔧 Fixing enrollment for mihyaeruu10@gmail.com\n');

    try {
        // Find final quiz for this course
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
            },
            select: {
                id: true,
                title: true,
                passingScore: true
            }
        });

        if (!finalQuiz) {
            console.log('❌ No final quiz found for this course');
            console.log('📝 Action needed: Mark a quiz as final quiz (isFinalQuiz=true)');

            // Show all quizzes for this course
            const allQuizzes = await prisma.quiz.findMany({
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
                    isFinalQuiz: true
                }
            });

            console.log('\nQuizzes in this course:');
            allQuizzes.forEach((q, i) => {
                console.log(`  ${i + 1}. ${q.title} (ID: ${q.id}) - isFinalQuiz: ${q.isFinalQuiz}`);
            });

            if (allQuizzes.length > 0) {
                const lastQuiz = allQuizzes[allQuizzes.length - 1];
                console.log(`\n💡 Suggestion: Mark "${lastQuiz.title}" as final quiz`);
                console.log(`   Run: UPDATE Quiz SET isFinalQuiz=true WHERE id='${lastQuiz.id}'`);
            }

            process.exit(0);
        }

        console.log(`✅ Final Quiz: ${finalQuiz.title}`);

        // Check if user has taken this quiz
        const quizAssignment = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId: userId,
                    quizId: finalQuiz.id
                }
            }
        });

        if (!quizAssignment) {
            console.log('❌ User has not taken the final quiz');
            console.log('📝 Action needed: User must complete the final quiz');
            process.exit(0);
        }

        console.log(`\n📊 Quiz Assignment:`);
        console.log(`   Status: ${quizAssignment.status}`);
        console.log(`   Score: ${quizAssignment.score}`);
        console.log(`   Completed: ${quizAssignment.completedAt}`);

        if (quizAssignment.score === null) {
            console.log('❌ Quiz has no score');
            console.log('📝 Action needed: User must retake the final quiz');
            process.exit(0);
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

        console.log(`\n🎯 Calculated Predicate: ${predicate} (Score: ${score})`);

        // Update enrollment
        const updated = await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId: userId,
                    courseId: courseId
                }
            },
            data: {
                finalScore: score,
                finalPredicate: predicate,
                courseCompleted: true,
                courseCompletedAt: quizAssignment.completedAt || new Date()
            }
        });

        console.log('\n✅ Enrollment updated successfully!');
        console.log(`   Final Score: ${updated.finalScore}`);
        console.log(`   Final Predicate: ${updated.finalPredicate}`);
        console.log(`   Course Completed: ${updated.courseCompleted}`);
        console.log(`   Completed At: ${updated.courseCompletedAt}`);

        console.log('\n🎓 User can now claim certificate!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixSpecificEnrollment();
