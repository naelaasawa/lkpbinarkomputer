// Quick test to verify schema fields exist
import { prisma } from '../lib/prisma';

async function testSchemaFields() {
    console.log('🔍 Testing Schema Fields...\n');

    try {
        // Test 1: Check if we can query new Quiz fields
        console.log('1. Testing Quiz.isFinalQuiz field...');
        const quizzes = await prisma.quiz.findMany({
            select: {
                id: true,
                title: true,
                isFinalQuiz: true
            },
            take: 1
        });
        console.log('   ✅ Quiz.isFinalQuiz field exists');

        // Test 2: Check if we can query new Enrollment fields
        console.log('\n2. Testing Enrollment certificate fields...');
        const enrollments = await prisma.enrollment.findMany({
            select: {
                id: true,
                courseCompleted: true,
                courseCompletedAt: true,
                finalScore: true,
                finalPredicate: true
            },
            take: 1
        });
        console.log('   ✅ Enrollment.courseCompleted field exists');
        console.log('   ✅ Enrollment.courseCompletedAt field exists');
        console.log('   ✅ Enrollment.finalScore field exists');
        console.log('   ✅ Enrollment.finalPredicate field exists');

        // Test 3: Check if we can query new Certificate fields
        console.log('\n3. Testing Certificate fields...');
        const certificates = await prisma.certificate.findMany({
            select: {
                id: true,
                certificateNumber: true,
                sequenceNumber: true,
                courseName: true,
                userName: true,
                predicate: true,
                finalScore: true,
                qrCodeData: true
            },
            take: 1
        });
        console.log('   ✅ Certificate.certificateNumber field exists');
        console.log('   ✅ Certificate.sequenceNumber field exists');
        console.log('   ✅ Certificate.courseName field exists');
        console.log('   ✅ Certificate.userName field exists');
        console.log('   ✅ Certificate.predicate field exists');
        console.log('   ✅ Certificate.finalScore field exists');
        console.log('   ✅ Certificate.qrCodeData field exists');

        // Test 4: Check Course.courseCode
        console.log('\n4. Testing Course.courseCode field...');
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                courseCode: true
            },
            take: 1
        });
        console.log('   ✅ Course.courseCode field exists');

        console.log('\n✅ All schema fields verified successfully!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Mark a quiz as final quiz (set isFinalQuiz = true)');
        console.log('   2. Complete the final quiz as a student');
        console.log('   3. Try claiming the certificate');

    } catch (error) {
        console.error('\n❌ Schema verification failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testSchemaFields();
