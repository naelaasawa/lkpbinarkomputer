import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { amount, customerDetails, itemDetails, userId, courseId } = await req.json();

        if (!userId || !courseId) {
            return NextResponse.json(
                { error: "Missing userId or courseId" },
                { status: 400 }
            );
        }

        // Find the local user by Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found in database. Please ensure you are logged in correctly." },
                { status: 404 }
            );
        }

        const localUserId = user.id;

        // Check if user is already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: localUserId,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { error: "User already enrolled in this course" },
                { status: 400 }
            );
        }

        // Create Purchase record
        const purchase = await prisma.purchase.create({
            data: {
                userId: localUserId,
                courseId,
                price: amount,
                status: "pending",

            },
        });

        const parameter = {
            transaction_details: {
                order_id: purchase.id, // Use Purchase ID as order_id
                gross_amount: amount,
            },
            customer_details: customerDetails,
            item_details: itemDetails,
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
                error: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?error=payment_failed`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?pending=true`,
            }
        };

        const transaction = await snap.createTransaction(parameter);

        // Update purchase with snap token
        await prisma.purchase.update({
            where: { id: purchase.id },
            data: { snapToken: transaction.token },
        });

        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            orderId: purchase.id,
        });
    } catch (error) {
        console.error("Midtrans Error:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}

