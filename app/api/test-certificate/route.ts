import { NextRequest, NextResponse } from 'next/server';
import { generateCertificate } from '@/lib/certificate';
import { sendCertificateEmail } from '@/lib/mail';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email') || 'test@example.com';

        const userName = "Abyan Dimas Test";
        const courseName = "Full Stack Web Development";
        const predicate = "Sangat Memuaskan";
        const certificateNumber = "001/TEST/CERT/2026";

        console.log('🎯 Generating certificate test...');
        console.log(`   User: ${userName}`);
        console.log(`   Course: ${courseName}`);
        console.log(`   Email: ${email}`);

        // Generate certificate
        const pdfBuffer = await generateCertificate(
            userName,
            courseName,
            predicate,
            certificateNumber
        );

        console.log('✅ Certificate generated successfully');

        // Send email
        const emailSuccess = await sendCertificateEmail(
            email,
            userName,
            courseName,
            pdfBuffer
        );

        if (emailSuccess) {
            return NextResponse.json({
                success: true,
                message: `Certificate generated and email sent to ${email}`,
                details: {
                    user: userName,
                    course: courseName,
                    predicate,
                    certificateNumber,
                    email
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Certificate generated but email failed to send',
                details: {
                    user: userName,
                    course: courseName,
                    predicate,
                    certificateNumber
                }
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('❌ Test failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error occurred'
        }, { status: 500 });
    }
}
