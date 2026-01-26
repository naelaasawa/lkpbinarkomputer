/**
 * Platform and device detection utilities
 */

export type Platform = 'windows' | 'macos' | 'android' | 'ios' | 'linux' | 'unknown';

/**
 * Detects if the current device is a mobile device
 */
export function isMobile(): boolean {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Detects if the current device is a tablet
 */
export function isTablet(): boolean {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent.toLowerCase();
    const isTabletUA = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua);

    return isTabletUA || (window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches && isTouchDevice());
}

/**
 * Detects if the current device is a desktop
 */
export function isDesktop(): boolean {
    return !isMobile() && !isTablet();
}

/**
 * Detects if the device has touch capabilities
 */
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - msMaxTouchPoints is IE specific
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Gets the current platform
 */
export function getPlatform(): Platform {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/mac/.test(platform)) return 'macos';
    if (/win/.test(platform)) return 'windows';
    if (/linux/.test(platform)) return 'linux';

    return 'unknown';
}

/**
 * Gets device type for styling purposes
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (isMobile() && !isTablet()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
}

/**
 * Checks if the device is likely a low-end device
 * Based on hardware concurrency and device memory
 */
export function isLowEndDevice(): boolean {
    if (typeof window === 'undefined') return false;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Check device memory if available (in GB)
    // @ts-ignore - deviceMemory is experimental
    const memory = navigator.deviceMemory || 4;

    // Consider low-end if <= 2 cores or <= 2GB RAM
    return cores <= 2 || memory <= 2;
}
