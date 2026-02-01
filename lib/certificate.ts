import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function generateCertificate(userName: string, courseName: string, date: Date = new Date()): Promise<Buffer> {
    try {
        // 1. Load the template
        const templatePath = path.join(process.cwd(), 'public', 'template-certificate.png');

        // Check if file exists
        if (!fs.existsSync(templatePath)) {
            console.error("Template not found at:", templatePath);
            throw new Error("Certificate template not found");
        }

        const templateBytes = fs.readFileSync(templatePath);

        // 2. Create a new PDF and embed the image
        const pdfDoc = await PDFDocument.create();
        const image = await pdfDoc.embedPng(templateBytes);
        const { width, height } = image.scale(1);

        // Add a page matching the image dimensions
        const page = pdfDoc.addPage([width, height]);

        // Draw the image as background
        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
        });

        // 3. Configure Fonts
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 4. Helper: Draw Center
        const drawCenteredText = (text: string, yFromTop: number, size: number, fontToUse: any, color = rgb(0.1, 0.2, 0.4)) => {
            const textWidth = fontToUse.widthOfTextAtSize(text, size);
            page.drawText(text, {
                x: (width - textWidth) / 2,
                y: height - yFromTop,
                size,
                font: fontToUse,
                color,
            });
        };

        // Helper: Draw Left
        const drawText = (text: string, x: number, yFromTop: number, size: number, fontToUse: any, color = rgb(0.1, 0.2, 0.4)) => {
            page.drawText(text, {
                x: x,
                y: height - yFromTop,
                size,
                font: fontToUse,
                color,
            });
        };

        // 5. Draw Content based on New Template (1024x682)
        // Colors: Blueish for Name/Course to match template theme?
        // Template uses dark blue for headers. Let's use RGB(0.06, 0.1, 0.2) approx for text.
        const textColor = rgb(0.1, 0.1, 0.2);
        const blueColor = rgb(0.1, 0.3, 0.6); // Lighter blue for Course Name maybe?

        // USER NAME
        // Dimension: 1024x682
        // Target: ~38% down (approx 260px from top)
        drawCenteredText(userName, 290, 48, fontBold, textColor);

        // COURSE NAME
        // Target: ~60% down (approx 415px from top)
        drawCenteredText(courseName.toUpperCase(), 370, 32, fontBold, blueColor);

        // DATES
        // Format: 'id-ID' for Indonesian format
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        // "Periode: Januari 2026"
        const periodStr = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

        // "Tanggal Terbit: 31 Januari 2026"
        const issueDateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Period (Left side)
        // Target: ~82% down (approx 560px from top)
        // X aligned with "Periode" label (approx 20% width?)
        // Wait, drawCenteredText centers it on page. We need drawText for specific X.

        // Issue Date (Right side)
        // Target: ~82% down
        // X aligned with "Tanggal Terbit" label (approx 80% width?)
        // Let's use specific drawText for these columns to align them properly relative to their column headers.

        // Find rough X centers for columns
        // Left Column Center: ~180px
        const leftColCenter = 190;
        const periodWidth = fontBold.widthOfTextAtSize(periodStr, 16);
        page.drawText(periodStr, {
            x: leftColCenter - (periodWidth / 2),
            y: height - 565,
            size: 16,
            font: fontBold,
            color: textColor
        });

        // Right Column Center: ~830px (1024 - 194 approx)
        const rightColCenter = 834;
        const issueWidth = fontBold.widthOfTextAtSize(issueDateStr, 16);
        page.drawText(issueDateStr, {
            x: rightColCenter - (issueWidth / 2),
            y: height - 565,
            size: 16,
            font: fontBold,
            color: textColor
        });


        // 6. Serialize
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);

    } catch (error) {
        console.error("Error generating certificate:", error);
        throw error;
    }
}
