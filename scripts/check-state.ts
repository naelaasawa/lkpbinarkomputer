// Check current state of TEST and WORD courses
import { prisma } from '../lib/prisma';

const USER_EMAIL = 'mihyaeruu10@gmail.com';

async function checkState() {
    console.log('🔍 Checking Current State...\n');

    try {
        const user = await prisma.user.findFirst({ where: { email: USER_EMAIL } });
        if (!user) { console.log('❌ User not found'); process.exit(1); }

        // Check TEST
        const courseTest = await prisma.course.findFirst({ where: { title: { contains: 'TEST' } } });
        if (courseTest) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseTest.id } }
            });
            console.log(`TEST Course: Score=${enrollment?.finalScore}, Predicate=${enrollment?.finalPredicate}`);
        }

        // Check WORD
        const courseWord = await prisma.course.findFirst({ where: { title: { contains: 'MICROSOFT WORD' } } });
        if (courseWord) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseWord.id } }
            });
            console.log(`WORD Course: Score=${enrollment?.finalScore}, Predicate=${enrollment?.finalPredicate}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkState();
