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

async function migrateQuizData() {
    try {
        console.log('🔄 Starting quiz data migration...\n');

        // Find all completed quiz assignments (those with completedAt set)
        const completedAssignments = await prisma.quizAssignment.findMany({
            where: {
                completedAt: {
                    not: null
                }
            }
        });

        console.log(`Found ${completedAssignments.length} completed quiz assignments to migrate.\n`);

        let updatedCount = 0;

        for (const assignment of completedAssignments) {
            await prisma.quizAssignment.update({
                where: { id: assignment.id },
                data: {
                    status: 'completed',
                    isLocked: true,
                    submittedAt: assignment.completedAt,
                    attemptedAt: assignment.completedAt
                }
            });
            updatedCount++;
            console.log(`✅ Migrated: ${assignment.id} (User: ${assignment.userId})`);
        }

        console.log(`\n🎉 Migration complete! Updated ${updatedCount} quiz assignments.`);
        console.log('\nAll completed quizzes are now locked with status "completed".');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateQuizData();
