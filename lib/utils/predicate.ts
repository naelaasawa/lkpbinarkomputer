/**
 * Certificate Predicate Utilities
 * 
 * Calculates certificate predicate based on final quiz score
 * and provides badge styling for UI display.
 */

export type Predicate = "Kurang" | "Memuaskan" | "Sangat Memuaskan" | null;

export interface PredicateBadge {
    color: string;
    emoji: string;
    bgColor: string;
    textColor: string;
}

/**
 * Calculate certificate predicate based on score percentage
 * 
 * @param scorePercentage - Score as percentage (0-100)
 * @returns Predicate string
 * 
 * Grading Scale:
 * - 1-69%: "Kurang"
 * - 70-89%: "Memuaskan"
 * - ≥ 90%: "Sangat Memuaskan"
 */
export function calculatePredicate(scorePercentage: number): Predicate {
    if (scorePercentage < 70) return "Kurang";
    if (scorePercentage < 90) return "Memuaskan";
    return "Sangat Memuaskan";
}

/**
 * Get badge styling for predicate display
 * 
 * @param predicate - Predicate value
 * @returns Badge configuration with colors and emoji
 */
export function getPredicateBadge(predicate: Predicate): PredicateBadge {
    switch (predicate) {
        case "Kurang":
            return {
                color: "red",
                emoji: "🔴",
                bgColor: "bg-red-100",
                textColor: "text-red-700"
            };
        case "Memuaskan":
            return {
                color: "yellow",
                emoji: "🟡",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-700"
            };
        case "Sangat Memuaskan":
            return {
                color: "green",
                emoji: "🟢",
                bgColor: "bg-green-100",
                textColor: "text-green-700"
            };
        default:
            return {
                color: "gray",
                emoji: "❌",
                bgColor: "bg-gray-100",
                textColor: "text-gray-700"
            };
    }
}

/**
 * Check if score meets minimum passing threshold for certificate
 * 
 * @param scorePercentage - Score as percentage (0-100)
 * @returns true (all scores receive certificates with appropriate predicate)
 */
export function canGetCertificate(scorePercentage: number): boolean {
    return scorePercentage >= 1; // All scores get certificates
}
