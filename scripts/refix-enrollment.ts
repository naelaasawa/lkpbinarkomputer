// Refix enrollment with correct predicate logic
import { prisma } from '../lib/prisma';
import { calculatePredicate } from '../lib/utils/predicate';

const COURSE_ID = '0cdf8abc-8e01-4571-ba4f-5ee05647fce0';
const USER_ID = '3622ec89-5c60-4038-9710-2904d9657ef5';

async function refixEnrollment() {
    console.log('🔧 Re-Fixing Enrollment Logic\n');

    try {
        // Get current enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: USER_ID,
                    courseId: COURSE_ID
                }
            }
        });

        if (!enrollment) {
            console.log('❌ Enrollment not found');
            process.exit(1);
        }

        console.log(`Current Predicate: ${enrollment.finalPredicate}`);
        console.log(`Final Score: ${enrollment.finalScore}`);

        if (enrollment.finalScore === null) {
            console.log('❌ No final score to recalculate from');
            process.exit(1);
        }

        // Recalculate predicate using the verified utility
        const newPredicate = calculatePredicate(enrollment.finalScore);

        console.log(`\n🎯 Recalculated: ${newPredicate} (Score: ${enrollment.finalScore})`);

        if (newPredicate !== enrollment.finalPredicate) {
            // Update enrollment
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    finalPredicate: newPredicate
                }
            });
            console.log('✅ Enrollment updated with correct predicate');
        } else {
            console.log('✅ Predicate is already correct');
        }

        // Also check if a certificate exists and update it too
        const certificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: USER_ID,
                    courseId: COURSE_ID
                }
            }
        });

        if (certificate) {
            console.log(`\n📜 Found existing certificate: ${certificate.certificateNumber}`);
            console.log(`   Cert Predicate: ${certificate.predicate}`);

            if (certificate.predicate !== newPredicate && newPredicate) {
                await prisma.certificate.update({
                    where: { id: certificate.id },
                    data: {
                        predicate: newPredicate
                    }
                });
                console.log('✅ Certificate record updated');
            } else {
                console.log('✅ Certificate predicate matches');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

refixEnrollment();
