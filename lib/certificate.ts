import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function generateCertificate(
    userName: string,
    courseName: string,
    predicate: string,
    certificateNumber: string,
    date: Date = new Date(),
    qrCodeDataURL?: string
): Promise<Buffer> {
    try {
        // 1. Load the template
        const templatePath = path.join(process.cwd(), 'public', 'template-sertifikat.png.jpeg');

        if (!fs.existsSync(templatePath)) {
            console.error("Template not found at:", templatePath);
            throw new Error("Certificate template not found");
        }

        const templateBytes = fs.readFileSync(templatePath);

        // 2. Create PDF and embed template
        const pdfDoc = await PDFDocument.create();
        const image = await pdfDoc.embedJpg(templateBytes);
        const { width, height } = image.scale(1);

        const page = pdfDoc.addPage([width, height]);

        // Draw template as background
        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
        });

        // 3. Configure Fonts
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // === ABSOLUTE POSITIONING SYSTEM ===
        // Template dimensions: 1600×1131 pixels
        // PDF coordinates: (0,0) is at BOTTOM-LEFT corner
        // Y-axis increases upward

        // === COLOR PALETTE ===
        const blackColor = rgb(0, 0, 0);
        const blueColor = rgb(0.122, 0.306, 0.784); // #1f4ed8
        const grayColor = rgb(0.4, 0.4, 0.4);

        // Validation
        if (!userName || userName.trim() === '') {
            throw new Error('User name is required');
        }

        // === FIXED COORDINATE SYSTEM ===
        // All Y coordinates are measured from BOTTOM of page

        const COORDS = {
            // Main content area (measured from bottom)
            certificateNumber: { y: 820, size: 30 },
            labelDiberiKepada: { y: 720, size: 11 },
            userName: { y: 680, size: 50 },
            labelProgramKursus: { y: 560, size: 11 },
            courseName: { y: 530, size: 45 },
            labelDiselenggarakan: { y: 440, size: 11 },
            organizerName: { y: 410, size: 16 },

            // Footer area
            footer: {
                predicateLabel: { x: 140, y: 150, size: 11 },
                predicateValue: { x: 200, y: 230, size: 35 },
                dateLabel: { y: 150, size: 11 },
                dateValue: { x: 1150, y: 230, size: 35 },
            }
        };

        // Helper function for centered text
        const drawCenteredText = (text: string, y: number, size: number, font: any, color: any) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            page.drawText(text, {
                x: (width - textWidth) / 2,
                y: y,
                size,
                font,
                color,
            });
        };

        // === RENDER TEXT ELEMENTS WITH ABSOLUTE POSITIONING ===

        // 1. Certificate Number
        drawCenteredText(
            certificateNumber,
            COORDS.certificateNumber.y,
            COORDS.certificateNumber.size,
            fontRegular,
            grayColor
        );

        // 2. "Diberikan kepada" label


        // 3. User Name (FOCAL POINT - bold, large)
        drawCenteredText(
            userName,
            COORDS.userName.y,
            COORDS.userName.size,
            fontBold,
            blackColor
        );

        // 4. "Telah menyelesaikan program kursus" label


        // 5. Course Name (uppercase, blue, bold)
        const courseNameUpper = courseName.toUpperCase();
        drawCenteredText(
            courseNameUpper,
            COORDS.courseName.y,
            COORDS.courseName.size,
            fontBold,
            blueColor
        );

        // 6. "Diselenggarakan oleh" label


        // 7. Organizer name


        // === FOOTER SECTION (Absolute Positioning) ===

        // Format date
        const issueDateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // LEFT: Predicate (label + value)


        page.drawText(predicate, {
            x: COORDS.footer.predicateValue.x,
            y: COORDS.footer.predicateValue.y,
            size: COORDS.footer.predicateValue.size,
            font: fontBold,
            color: blackColor
        });

        // RIGHT: Date (label + value, right-aligned)
        const dateXBase = (COORDS.footer.dateValue as any).x || (width - 200);



        page.drawText(issueDateStr, {
            x: dateXBase,
            y: COORDS.footer.dateValue.y,
            size: COORDS.footer.dateValue.size,
            font: fontBold,
            color: blackColor
        });

        // QR CODE (bottom-right corner)


        // Logging
        console.log('[CERTIFICATE] Absolute positioning system applied');
        console.log(`  Template: ${width}×${height}px`);
        console.log(`  Cert Number: ${certificateNumber}`);
        console.log(`  User: ${userName}`);
        console.log(`  Course: ${courseName}`);
        console.log(`  Predicate: ${predicate}`);

        // Serialize
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);

    } catch (error) {
        console.error("Error generating certificate:", error);
        throw error;
    }
}
