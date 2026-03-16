// Direct fix - mark a quiz as final and update enrollment
import { prisma } from '../lib/prisma';

const COURSE_ID = '0cdf8abc-8e01-4571-ba4f-5ee05647fce0';
const USER_ID = '3622ec89-5c60-4038-9710-2904d9657ef5';

async function directFix() {
    console.log('🔧 Direct Fix Script\n');

    try {
        // Step 1: Find ALL quizzes in this course
        const modules = await prisma.module.findMany({
            where: { courseId: COURSE_ID },
            include: {
                lessons: {
                    where: {
                        quizId: { not: null }
                    },
                    include: {
                        quiz: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        });

        const quizzesInCourse: any[] = [];
        for (const module of modules) {
            for (const lesson of module.lessons) {
                if (lesson.quiz) {
                    quizzesInCourse.push({
                        quizId: lesson.quiz.id,
                        quizTitle: lesson.quiz.title,
                        lessonTitle: lesson.title,
                        moduleTitle: module.title,
                        isFinalQuiz: lesson.quiz.isFinalQuiz
                    });
                }
            }
        }

        console.log(`Found ${quizzesInCourse.length} quiz(zes) in course:\n`);
        quizzesInCourse.forEach((q, i) => {
            console.log(`${i + 1}. ${q.quizTitle}`);
            console.log(`   Module: ${q.moduleTitle}`);
            console.log(`   Lesson: ${q.lessonTitle}`);
            console.log(`   Is Final: ${q.isFinalQuiz ? '✅' : '❌'}`);
        });

        if (quizzesInCourse.length === 0) {
            console.log('\n❌ No quizzes found in this course!');
            process.exit(1);
        }

        // Step 2: Check if any quiz is marked as final
        const finalQuiz = quizzesInCourse.find(q => q.isFinalQuiz);

        let quizToUse: any;

        if (!finalQuiz) {
            // Use the last quiz
            quizToUse = quizzesInCourse[quizzesInCourse.length - 1];
            console.log(`\n📝 No final quiz marked. Will use last quiz: "${quizToUse.quizTitle}"`);

            // Mark it as final
            await prisma.quiz.update({
                where: { id: quizToUse.quizId },
                data: { isFinalQuiz: true }
            });
            console.log('✅ Marked as final quiz');
        } else {
            quizToUse = finalQuiz;
            console.log(`\n✅ Final quiz already set: "${quizToUse.quizTitle}"`);
        }

        // Step 3: Check user's quiz assignment
        const assignment = await prisma.quizAssignment.findUnique({
            where: {
                userId_quizId: {
                    userId: USER_ID,
                    quizId: quizToUse.quizId
                }
            }
        });

        if (!assignment) {
            console.log('\n❌ User has not taken this quiz');
            console.log('📝 Action: User must complete the final quiz');
            process.exit(0);
        }

        console.log(`\n📊 Quiz Assignment:`);
        console.log(`   Status: ${assignment.status}`);
        console.log(`   Score: ${assignment.score}`);
        console.log(`   Completed: ${assignment.completedAt}`);

        if (!assignment.score) {
            console.log('\n❌ No score recorded');
            console.log('📝 Action: User must retake the quiz');
            process.exit(0);
        }

        // Step 4: Calculate predicate
        const score = assignment.score;
        let predicate: string;

        if (score >= 90) predicate = "Sangat Memuaskan";
        else if (score >= 80) predicate = "Memuaskan";
        else if (score >= 70) predicate = "Cukup";
        else predicate = "Kurang";

        console.log(`\n🎯 Score: ${score} → Predicate: ${predicate}`);

        // Step 5: Update enrollment
        await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId: USER_ID,
                    courseId: COURSE_ID
                }
            },
            data: {
                finalScore: score,
                finalPredicate: predicate,
                courseCompleted: true,
                courseCompletedAt: assignment.completedAt || new Date()
            }
        });

        console.log('\n✅✅✅ ENROLLMENT UPDATED! ✅✅✅');
        console.log('🎓 User can now claim certificate!');
        console.log('\nRefresh the page and try claiming again.');

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

directFix();
