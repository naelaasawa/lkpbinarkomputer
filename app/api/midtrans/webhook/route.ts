import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        { message: "Server API key is missing" },
        { status: 500 }
      );
    }

    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
    } = body;

    const mysignatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (mysignatureKey !== signatureKey) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: orderId },
    });

    if (!purchase) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Update purchase status
    await prisma.purchase.update({
      where: { id: orderId },
      data: {
        status: transactionStatus,
        paymentType: paymentType,
      },
    });

    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      if (fraudStatus == "challenge") {
        // Handle challenge if needed
      } else if (fraudStatus == "accept" || !fraudStatus) {
        // Enroll user
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            }
          }
        });

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            },
          });
        }
      }
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // Transaction failed
    } else if (transactionStatus == "pending") {
      // Transaction pending
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

