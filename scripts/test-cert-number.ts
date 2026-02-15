import { prisma } from '../lib/prisma';
import { generateCertificateNumber } from '../lib/certificate-number';

async function testCertificateNumber() {
    try {
        console.log('\n🧪 Testing Certificate Number Generation\n');

        // Test 1: Generate number for Microsoft Word
        console.log('Test 1: Microsoft Word (should use PKO code)');
        const result1 = await generateCertificateNumber('Microsoft Word', new Date(2026, 1, 12)); // Feb 12, 2026
        console.log(`  Generated: ${result1.number}`);
        console.log(`  Sequence: ${result1.sequence}`);
        console.log(`  Expected Format: NNN/BKOMP/PKO/II/2026\n`);

        // Test 2: Generate another for same course (should increment sequence)
        console.log('Test 2: Another Microsoft Word certificate (should increment)');
        const result2 = await generateCertificateNumber('Microsoft Word', new Date(2026, 1, 15));
        console.log(`  Generated: ${result2.number}`);
        console.log(`  Sequence: ${result2.sequence}`);
        console.log(`  Should be sequence + 1\n`);

        // Test 3: Different course
        console.log('Test 3: Komputer Dasar (should use PKD code)');
        const result3 = await generateCertificateNumber('Komputer Dasar', new Date(2026, 1, 20));
        console.log(`  Generated: ${result3.number}`);
        console.log(`  Sequence: ${result3.sequence}\n`);

        // Test 4: Unknown course (should throw error)
        console.log('Test 4: Unknown course (should throw error)');
        try {
            await generateCertificateNumber('Unknown Course', new Date());
        } catch (error: any) {
            console.log(`  ✅ Error caught as expected: ${error.message}\n`);
        }

        console.log('✅ All tests completed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCertificateNumber();
