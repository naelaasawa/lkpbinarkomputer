import "dotenv/config";
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function testQuizSubmission() {
    try {
        console.log('🧪 Testing quiz submission...\n');

        // Test creating a quiz assignment with new fields
        const testData = {
            userId: 'test-user-id',
            quizId: 'test-quiz-id',
            status: 'completed',
            isLocked: true,
            score: 85,
            answers: JSON.stringify({ 0: 'A', 1: 'B' }),
            attemptedAt: new Date(),
            submittedAt: new Date(),
            completedAt: new Date()
        };

        console.log('Test data:', testData);
        console.log('\nAttempting to create QuizAssignment with new fields...\n');

        // This will fail if Prisma doesn't recognize the fields
        const result = await prisma.quizAssignment.create({
            data: testData
        });

        console.log('✅ SUCCESS! QuizAssignment created:', result);
        console.log('\nNew fields are recognized by Prisma client.');

        // Cleanup
        await prisma.quizAssignment.delete({
            where: { id: result.id }
        });
        console.log('\n🧹 Cleanup: Test record deleted.');

    } catch (error: any) {
        console.error('❌ FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('\nFull error:', error);

        if (error.message.includes('Unknown argument') || error.message.includes('Unknown field')) {
            console.error('\n⚠️  DIAGNOSIS: Prisma client does NOT recognize the new fields!');
            console.error('Solution: Run "npx prisma generate" and restart dev server.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testQuizSubmission();
