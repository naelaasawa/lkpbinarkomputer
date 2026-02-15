/**
 * Script to create dummy completed quiz assignment for testing
 * Usage: npx tsx scripts/create-dummy-quiz.ts
 */

import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔍 Finding existing users and quizzes...\n');

    // Get first user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('❌ No users found. Please create a user first.');
        return;
    }
    console.log(`✅ Found user: ${user.email} (${user.id})`);

    // Get first quiz
    const quiz = await prisma.quiz.findFirst({
        include: {
            questions: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!quiz) {
        console.error('❌ No quizzes found. Please create a quiz first.');
        return;
    }
    console.log(`✅ Found quiz: ${quiz.title} (${quiz.id})`);
    console.log(`   Questions: ${quiz.questions.length}\n`);

    // Check if assignment already exists
    const existingAssignment = await prisma.quizAssignment.findUnique({
        where: {
            userId_quizId: {
                userId: user.id,
                quizId: quiz.id
            }
        }
    });

    if (existingAssignment) {
        console.log('⚠️  Quiz assignment already exists!');
        console.log(`   Status: ${existingAssignment.status}`);
        console.log(`   Score: ${existingAssignment.score}%`);
        console.log('\n🗑️  Deleting existing assignment...');
        await prisma.quizAssignment.delete({
            where: { id: existingAssignment.id }
        });
    }

    // Create dummy answers (just pick first option for each question)
    const dummyAnswers: { [key: string]: string } = {};
    let correctCount = 0;

    quiz.questions.forEach((question: any, idx: number) => {
        // For testing, let's make some correct and some wrong
        // Even indices = correct, odd indices = first option
        if (idx % 2 === 0 && question.correctAnswer) {
            dummyAnswers[idx.toString()] = question.correctAnswer;
            correctCount++;
        } else if (question.options && question.options.length > 0) {
            // Parse options if string
            const options = typeof question.options === 'string'
                ? JSON.parse(question.options)
                : question.options;
            dummyAnswers[idx.toString()] = options[0];
        }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    console.log(`📝 Creating completed quiz assignment...`);
    console.log(`   Correct answers: ${correctCount}/${quiz.questions.length}`);
    console.log(`   Score: ${score}%\n`);

    // Create quiz assignment
    const assignment = await prisma.quizAssignment.create({
        data: {
            userId: user.id,
            quizId: quiz.id,
            status: 'completed',
            score: score,
            answers: JSON.stringify(dummyAnswers),
            completedAt: new Date()
        }
    });

    console.log('✅ Dummy quiz assignment created successfully!\n');
    console.log('📋 Details:');
    console.log(`   Assignment ID: ${assignment.id}`);
    console.log(`   User: ${user.email}`);
    console.log(`   Quiz: ${quiz.title}`);
    console.log(`   Status: ${assignment.status}`);
    console.log(`   Score: ${assignment.score}%`);
    console.log(`   Completed: ${assignment.completedAt}`);
    console.log('\n🧪 To test:');
    console.log(`   1. Login as: ${user.email}`);
    console.log(`   2. Navigate to quiz: ${quiz.title}`);
    console.log(`   3. Should see results page immediately`);
    console.log(`   4. "Review Answers" button should be visible\n`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
