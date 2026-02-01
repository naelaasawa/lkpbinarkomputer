const { generateCertificate } = require("../lib/certificate");
const fs = require("fs");
const path = require("path");

// Mocking dependencies if necessary or ensuring the environment supports execution
// Note: We are using CommonJS require because running with simple node/ts-node might differ from Next.js ES modules env.
// However, since the project is ESNext, we might need a specific setup. 
// A safer bet for a quick script in this mixed env is to rely on ts-node with specific compiler options or use relative imports and standard Node logic.

async function main() {
    console.log("Starting Certificate Generation Test...");

    try {
        const userName = "Mihyaeruu";
        const courseName = "Microsoft Office";

        console.log(`Generating certificate for: ${userName}, Course: ${courseName}`);

        const pdfBuffer = await generateCertificate(userName, courseName);

        const outputPath = path.join(process.cwd(), "test-certificate.pdf");
        fs.writeFileSync(outputPath, pdfBuffer);

        console.log("✅ Certificate generated successfully!");
        console.log(`📂 Output saved to: ${outputPath}`);
        console.log("👉 Please open this file to verify the layout.");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

main();
