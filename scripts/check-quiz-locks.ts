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

async function checkQuizLocks() {
    try {
        console.log('🔍 Checking quiz assignment locks...\n');

        const assignments = await prisma.quizAssignment.findMany({
            include: {
                quiz: {
                    select: {
                        title: true
                    }
                },
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                completedAt: 'desc'
            },
            take: 10
        });

        console.log(`Found ${assignments.length} quiz assignments:\n`);

        assignments.forEach((assignment, idx) => {
            console.log(`${idx + 1}. Quiz: ${assignment.quiz.title}`);
            console.log(`   User: ${assignment.user.email}`);
            console.log(`   Status: ${assignment.status}`);
            console.log(`   Locked: ${assignment.isLocked ? '🔒 YES' : '❌ NO'}`);
            console.log(`   Score: ${assignment.score ?? 'N/A'}`);
            console.log(`   Completed: ${assignment.completedAt ? assignment.completedAt.toISOString() : 'Not completed'}`);
            console.log(`   Submitted: ${assignment.submittedAt ? assignment.submittedAt.toISOString() : 'Not submitted'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkQuizLocks();
