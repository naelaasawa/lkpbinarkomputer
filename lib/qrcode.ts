import QRCode from 'qrcode';

/**
 * Generate QR code for certificate verification
 * @param certificateNumber - The certificate number (e.g., "023/BKOMP/PKO/I/2026")
 * @returns Data URL of the QR code image
 */
export async function generateCertificateQR(certificateNumber: string): Promise<string> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-certificate/${encodeURIComponent(certificateNumber)}`;

    try {
        const qrDataURL = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            width: 200, // Size for PDF embedding
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        console.log(`[QR_CODE] Generated for: ${certificateNumber}`);
        return qrDataURL;
    } catch (error) {
        console.error('[QR_CODE] Generation failed:', error);
        throw new Error(`Failed to generate QR code: ${error}`);
    }
}

/**
 * Generate QR code buffer for direct embedding
 * @param certificateNumber - The certificate number
 * @returns Buffer containing PNG image data
 */
export async function generateCertificateQRBuffer(certificateNumber: string): Promise<Buffer> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-certificate/${encodeURIComponent(certificateNumber)}`;

    try {
        const buffer = await QRCode.toBuffer(verifyUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 200,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return buffer;
    } catch (error) {
        console.error('[QR_CODE] Buffer generation failed:', error);
        throw new Error(`Failed to generate QR code buffer: ${error}`);
    }
}
