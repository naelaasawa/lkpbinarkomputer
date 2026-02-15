/**
 * Quick Test Script for Predicate Calculation
 * 
 * This tests the updated predicate thresholds:
 * - 1-69%: "Kurang"
 * - 70-89%: "Memuaskan"
 * - 90-100%: "Sangat Memuaskan"
 */

import { calculatePredicate, canGetCertificate } from '../lib/utils/predicate';

console.log('\n🧪 Testing Certificate Predicate Calculation\n');
console.log('='.repeat(60));

const testCases = [
    { score: 1, expected: 'Kurang' },
    { score: 50, expected: 'Kurang' },
    { score: 69, expected: 'Kurang' },
    { score: 70, expected: 'Memuaskan' },
    { score: 75, expected: 'Memuaskan' },
    { score: 89, expected: 'Memuaskan' },
    { score: 90, expected: 'Sangat Memuaskan' },
    { score: 95, expected: 'Sangat Memuaskan' },
    { score: 100, expected: 'Sangat Memuaskan' },
];

let passCount = 0;
let failCount = 0;

testCases.forEach(({ score, expected }) => {
    const result = calculatePredicate(score);
    const canCert = canGetCertificate(score);
    const passed = result === expected && canCert === true;

    if (passed) {
        passCount++;
        console.log(`✅ Score ${score.toString().padStart(3)}% → "${result}" (Expected: "${expected}")`);
    } else {
        failCount++;
        console.log(`❌ Score ${score.toString().padStart(3)}% → "${result}" (Expected: "${expected}")`);
    }
});

console.log('='.repeat(60));
console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
    console.log('🎉 All tests passed! Predicate calculation is working correctly.\n');
} else {
    console.log('⚠️  Some tests failed. Please review the implementation.\n');
    process.exit(1);
}
