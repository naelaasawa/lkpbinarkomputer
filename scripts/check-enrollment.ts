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

async function checkEnrollmentTable() {
    try {
        // Check if Enrollment table exists and its structure
        const enrollments = await prisma.enrollment.findMany({
            take: 1
        });

        console.log('✅ Enrollment table exists');
        console.log('Sample enrollment:', enrollments[0] || 'No enrollments yet');

        // Check User table
        const users = await prisma.user.findMany({
            take: 1,
            select: { id: true, email: true, clerkId: true }
        });
        console.log('\n✅ Users in database:', users.length);
        if (users[0]) {
            console.log('Sample user:', users[0]);
        }

        // Check Course table
        const courses = await prisma.course.findMany({
            take: 1,
            select: { id: true, title: true, price: true }
        });
        console.log('\n✅ Courses in database:', courses.length);
        if (courses[0]) {
            console.log('Sample course:', courses[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnrollmentTable();
