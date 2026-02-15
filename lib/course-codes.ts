/**
 * Course Code Mapping for Certificate Number Generation
 * Maps course titles to their certificate codes (case-insensitive)
 */

export const COURSE_CODE_MAP: Record<string, string> = {
    // Komputer
    "komputer dasar": "PKD",
    "komputer administrasi": "PKA",
    "microsoft office": "PKO",
    "microsoft word": "PKO", // Alias for Microsoft Office

    // Desain Grafis
    "desain grafis dasar": "DGD",
    "desain grafis advance": "DGA",

    // Web & Programming
    "web dasar": "WBD",
    "programming": "PRT",
    "coding": "PRT",

    // Multimedia
    "animasi": "ANM",

    // IT & Marketing
    "it fundamental": "ITF",
    "digital marketing": "MKT",

    // Test courses
    "test": "TST",
};

/**
 * Get course code from course title
 * @param courseTitle - The course title to look up
 * @returns Course code (e.g., "PKO") or null if not found
 * @throws Error if course code mapping not found
 */
export function getCourseCode(courseTitle: string): string {
    const normalized = courseTitle.toLowerCase().trim();
    const code = COURSE_CODE_MAP[normalized];

    if (!code) {
        throw new Error(
            `Course code mapping not found for: "${courseTitle}". ` +
            `Please add mapping to lib/course-codes.ts before generating certificate.`
        );
    }

    return code;
}

/**
 * Check if a course has a code mapping
 * @param courseTitle - The course title to check
 * @returns true if mapping exists, false otherwise
 */
export function hasCourseCode(courseTitle: string): boolean {
    const normalized = courseTitle.toLowerCase().trim();
    return normalized in COURSE_CODE_MAP;
}

/**
 * Get all available course codes
 * @returns Array of all course codes
 */
export function getAllCourseCodes(): string[] {
    return Array.from(new Set(Object.values(COURSE_CODE_MAP)));
}
