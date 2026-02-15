import { prisma } from './prisma';
import { getCourseCode } from './course-codes';

/**
 * Generate a unique certificate number for a course completion
 * Format: {NNN}/BKOMP/{KODE_PROGRAM}/{BULAN_ROMAWI}/{TAHUN}
 * Example: 023/BKOMP/PKO/I/2026
 * 
 * @param courseTitle - The course title to generate certificate for
 * @param issuedDate - The date the certificate is issued (default: now)
 * @returns Object with formatted certificate number and sequence
 */
export async function generateCertificateNumber(
    courseTitle: string,
    issuedDate: Date = new Date()
): Promise<{ number: string; sequence: number }> {

    // 1. Get course code (throws if not found)
    const courseCode = getCourseCode(courseTitle);

    // 2. Get month (Roman numeral) and year
    const month = getRomanMonth(issuedDate.getMonth() + 1);
    const year = issuedDate.getFullYear();

    // 3. Get next sequence number for this course + year
    // Only count certificates for the same course title in the same year
    const lastCert = await prisma.certificate.findFirst({
        where: {
            courseName: courseTitle,
            issuedAt: {
                gte: new Date(year, 0, 1), // Start of year
                lt: new Date(year + 1, 0, 1) // Start of next year
            }
        },
        orderBy: { sequenceNumber: 'desc' },
        select: { sequenceNumber: true }
    });

    // Increment from last sequence, or start at 1
    const sequence = (lastCert?.sequenceNumber || 0) + 1;
    const paddedSeq = sequence.toString().padStart(3, '0');

    // 4. Format: 023/BKOMP/PKO/I/2026
    const certificateNumber = `${paddedSeq}/BKOMP/${courseCode}/${month}/${year}`;

    console.log(`[CERT_NUMBER] Generated: ${certificateNumber} (seq ${sequence} for ${courseTitle} in ${year})`);

    return { number: certificateNumber, sequence };
}

/**
 * Convert month number to Roman numeral
 * @param month - Month number (1-12)
 * @returns Roman numeral string (I-XII)
 */
function getRomanMonth(month: number): string {
    const romans = [
        'I',    // 1 - January
        'II',   // 2 - February
        'III',  // 3 - March
        'IV',   // 4 - April
        'V',    // 5 - May
        'VI',   // 6 - June
        'VII',  // 7 - July
        'VIII', // 8 - August
        'IX',   // 9 - September
        'X',    // 10 - October
        'XI',   // 11 - November
        'XII'   // 12 - December
    ];

    if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month}. Must be between 1-12.`);
    }

    return romans[month - 1];
}

/**
 * Parse certificate number to extract components
 * @param certificateNumber - Full certificate number (e.g., "023/BKOMP/PKO/I/2026")
 * @returns Parsed components or null if invalid format
 */
export function parseCertificateNumber(certificateNumber: string): {
    sequence: number;
    institution: string;
    courseCode: string;
    month: string;
    year: number;
} | null {
    const parts = certificateNumber.split('/');

    if (parts.length !== 5) return null;

    const [seq, institution, courseCode, month, yearStr] = parts;
    const sequence = parseInt(seq, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(sequence) || isNaN(year)) return null;

    return {
        sequence,
        institution,
        courseCode,
        month,
        year
    };
}
