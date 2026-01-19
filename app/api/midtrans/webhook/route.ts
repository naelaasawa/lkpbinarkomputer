import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook received:", JSON.stringify(body, null, 2));

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error("❌ Server key missing!");
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

    console.log(`📝 Processing order: ${orderId}, status: ${transactionStatus}`);

    const mysignatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (mysignatureKey !== signatureKey) {
      console.error("❌ Invalid signature!");
      console.log("Expected:", mysignatureKey);
      console.log("Received:", signatureKey);
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    console.log("✅ Signature valid");

    const purchase = await prisma.purchase.findUnique({
      where: { id: orderId },
    });

    if (!purchase) {
      console.error(`❌ Purchase not found: ${orderId}`);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    console.log(`✅ Purchase found:`, purchase);

    // Update purchase status
    await prisma.purchase.update({
      where: { id: orderId },
      data: {
        status: transactionStatus,
        paymentType: paymentType,
      },
    });

    console.log(`✅ Purchase status updated to: ${transactionStatus}`);

    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      console.log(`💰 Payment successful! Fraud status: ${fraudStatus || 'none'}`);

      if (fraudStatus == "challenge") {
        console.log("⚠️ Fraud challenge - not enrolling");
      } else if (fraudStatus == "accept" || !fraudStatus) {
        console.log(`👤 Attempting to enroll user ${purchase.userId} to course ${purchase.courseId}`);

        // Enroll user
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            }
          }
        });

        if (existingEnrollment) {
          console.log("ℹ️ User already enrolled, skipping");
        } else {
          await prisma.enrollment.create({
            data: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            },
          });
          console.log("✅ User enrolled successfully!");
        }
      }
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      console.log(`❌ Transaction failed: ${transactionStatus}`);
    } else if (transactionStatus == "pending") {
      console.log(`⏳ Transaction pending`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

