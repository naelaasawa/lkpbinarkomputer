/**
 * Course Code Mapping for Certificate Number Generation
 * Maps course titles to their certificate codes (case-insensitive).
 * If a course is NOT in this map, a code is auto-generated from its title initials.
 * Add entries here ONLY if you want to override the auto-generated code.
 */

export const COURSE_CODE_MAP: Record<string, string> = {
    // Komputer
    "komputer dasar": "PKD",
    "komputer administrasi": "PKA",

    // Microsoft Office (semua produk MS Office → PKO)
    "microsoft office": "PKO",
    "microsoft word": "PKO",
    "microsoft excel": "PKO",
    "microsoft powerpoint": "PKO",
    "microsoft access": "PKO",
    "ms office": "PKO",
    "ms word": "PKO",
    "ms excel": "PKO",
    "ms powerpoint": "PKO",

    // Desain Grafis
    "desain grafis dasar": "DGD",
    "desain grafis advance": "DGA",
    "desain grafis": "DGD",

    // Web & Programming
    "web dasar": "WBD",
    "programming": "PRT",
    "coding": "PRT",
    "pemrograman": "PRT",

    // Multimedia
    "animasi": "ANM",
    "animasi dasar": "ANM",

    // IT & Marketing
    "it fundamental": "ITF",
    "digital marketing": "MKT",

    // Test courses
    "test": "TST",
};

/**
 * Auto-generate a 3-letter course code from the course title.
 * Takes the first letter of each significant word (skipping common words).
 * Examples:
 *   "MICROSOFT EXCEL" → "MSE"
 *   "DESAIN GRAFIS ADVANCE" → "DGA"
 *   "WEB PROGRAMMING" → "WBP"
 */
function autoGenerateCourseCode(courseTitle: string): string {
    const SKIP_WORDS = new Set(['dan', 'dan', 'the', 'of', 'for', 'and', 'atau', 'ke', 'di', 'in', 'on', 'a', 'an']);
    const words = courseTitle
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0 && !SKIP_WORDS.has(w.toLowerCase()));

    if (words.length === 0) {
        // Fallback: take first 3 chars of the title
        return courseTitle.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    }

    if (words.length === 1) {
        // Single word: take first 3 chars
        return words[0].substring(0, 3).toUpperCase();
    }

    if (words.length === 2) {
        // Two words: first letter of word 1 + first 2 letters of word 2
        return (words[0][0] + words[1].substring(0, 2)).toUpperCase();
    }

    // 3+ words: first letter of each of the first 3 words
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

/**
 * Get course code from course title.
 * First checks the manual map, then auto-generates from title initials.
 * Never throws — always returns a valid 3-letter code.
 *
 * @param courseTitle - The course title to look up
 * @returns Course code (e.g., "PKO")
 */
export function getCourseCode(courseTitle: string): string {
    const normalized = courseTitle.toLowerCase().trim();
    const mapped = COURSE_CODE_MAP[normalized];

    if (mapped) {
        return mapped;
    }

    // Auto-generate from title initials
    const autoCode = autoGenerateCourseCode(courseTitle);
    console.log(`[COURSE_CODE] No mapping for "${courseTitle}", auto-generated code: ${autoCode}`);
    return autoCode;
}

/**
 * Check if a course has a manual code mapping
 * @param courseTitle - The course title to check
 * @returns true if a manual mapping exists, false otherwise
 */
export function hasCourseCode(courseTitle: string): boolean {
    const normalized = courseTitle.toLowerCase().trim();
    return normalized in COURSE_CODE_MAP;
}

/**
 * Get all available course codes (from manual map only)
 * @returns Array of all course codes
 */
export function getAllCourseCodes(): string[] {
    return Array.from(new Set(Object.values(COURSE_CODE_MAP)));
}
