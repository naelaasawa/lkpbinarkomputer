import { generateCertificate } from "../lib/certificate.js";
import { sendCertificateEmail } from "../lib/mail.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Starting Certificate System Test...");

    try {
        const userName = "Abyan Dimas Test";
        const courseName = "Full Stack Web Development";

        // Get email from command line arg or .env or default
        const argEmail = process.argv[2];
        const targetEmail = argEmail || process.env.TEST_EMAIL || process.env.GMAIL_USER || "test@example.com";

        if (argEmail) {
            console.log(`🎯 Custom recipient provided: ${argEmail}`);
        } else {
            console.log(`ℹ️ No recipient arg provided. Using default: ${targetEmail}`);
            console.log(`   (Usage: node scripts/send-certificate.mjs user@example.com)`);
        }

        console.log(`1. Generating certificate PDF...`);
        const pdfBuffer = await generateCertificate(userName, courseName, "Sangat Memuaskan", "001/TEST/CERT/2026");

        const outputPath = path.join(process.cwd(), "test-certificate.pdf");
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`   ✅ Saved locally to: ${outputPath}`);

        console.log(`2. Sending email to ${targetEmail}...`);
        if (!process.env.GMAIL_USER) {
            console.warn("   ⚠️ GMAIL_USER not set in .env. Email sending will be simulated.");
        }

        const emailSuccess = await sendCertificateEmail(targetEmail, userName, courseName, pdfBuffer);

        if (emailSuccess) {
            console.log("   ✅ Email function returned success.");
        } else {
            console.error("   ❌ Email function returned failure.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

main();
