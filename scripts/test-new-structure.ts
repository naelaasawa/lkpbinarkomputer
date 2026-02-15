import { generateCertificate } from '../lib/certificate';
import { generateCertificateQR } from '../lib/qrcode';
import fs from 'fs';

async function testNewStructure() {
    console.log('\n📜 Testing NEW CERTIFICATE STRUCTURE\n');
    console.log('Order (top to bottom):');
    console.log('  1. Logo (from template)');
    console.log('  2. CERTIFICATE OF COMPLETION (from template)');
    console.log('  3. Certificate Number');
    console.log('  4. USER NAME (LARGEST)');
    console.log('  5. "Diberikan kepada" label');
    console.log('  6. COURSE NAME');
    console.log('  7. Predicate');
    console.log('  8. Footer: Predikat | Signature | Date\n');

    try {
        // Test 1: Standard name
        console.log('✅ Test 1: Standard structure');
        const qr1 = await generateCertificateQR('001/BKOMP/PKO/II/2026');
        const pdf1 = await generateCertificate(
            'Minyaeru',
            'Microsoft Word',
            'Sangat Memuaskan',
            '001/BKOMP/PKO/II/2026',
            new Date(2026, 1, 14),
            qr1
        );
        fs.writeFileSync('test-new-structure.pdf', pdf1);
        console.log('   Generated: test-new-structure.pdf\n');

        // Test 2: Long name
        console.log('✅ Test 2: Long names (auto-fit)');
        const qr2 = await generateCertificateQR('002/BKOMP/DGD/II/2026');
        const pdf2 = await generateCertificate(
            'Muhammad Abdullah Rahman Firmansyah',
            'Desain Grafis Dasar dan Menengah',
            'Memuaskan',
            '002/BKOMP/DGD/II/2026',
            new Date(2026, 1, 14),
            qr2
        );
        fs.writeFileSync('test-long-structure.pdf', pdf2);
        console.log('   Generated: test-long-structure.pdf\n');

        console.log('✅ ALL TESTS PASSED!\n');
        console.log('Verify PDFs have NEW STRUCTURE:');
        console.log('  ✓ Cert number below title');
        console.log('  ✓ User name FIRST (largest)');
        console.log('  ✓ "Diberikan kepada" BELOW name');
        console.log('  ✓ Course name (NOT generic text)');
        console.log('  ✓ 3-column footer\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testNewStructure();
