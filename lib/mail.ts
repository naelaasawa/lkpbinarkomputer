import nodemailer from 'nodemailer';

export const sendCertificateEmail = async (to: string, userName: string, courseName: string) => {
    // 1. Simulation Mode (Fallback)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.log("==================================================================");
        console.log(" [SIMULATION MODE] Email Credentials Missing - Logging email instead");
        console.log(` To: ${to}`);
        console.log(` Subject: Certificate of Completion - ${courseName}`);
        console.log(" Content: Congratulations! You have completed the course.");
        console.log(" (To send real emails, set GMAIL_USER and GMAIL_PASS in .env)");
        console.log("==================================================================");
        return true; // Pretend it succeeded
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: `Certificate of Completion - ${courseName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb; text-align: center;">Congratulations, ${userName}!</h2>
                <p style="text-align: center; font-size: 16px; color: #4b5563;">
                    You have successfully completed the course <strong>${courseName}</strong>.
                </p>
                <div style="margin: 30px 0; text-align: center;">
                    <p style="font-size: 14px; color: #6b7280;">
                        This creates a formal record of your achievement.
                    </p>
                </div>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="text-align: center; font-size: 12px; color: #9ca3af;">
                    LKP Binar Komputer
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
