import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { validateCoupon } from "@/lib/coupon";
import { getMergedVariants } from "@/lib/courseOverrides";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { courseId, couponCode } = await req.json();

  const allVariants = await getMergedVariants();
  const variant = allVariants.find((v) => v.id === courseId);

  if (!variant || variant.status !== "active") {
    return NextResponse.json({ error: "Course not found or not available for enrollment" }, { status: 404 });
  }

  const baseAmount = variant.price;
  const name = variant.title;

  let finalAmount = baseAmount;
  let discountApplied = false;
  let discountPercent = 0;
  let couponError: string | undefined;

  if (couponCode?.trim()) {
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase());
      if (result.valid) {
        discountPercent = result.discount ?? 10;
        finalAmount = Math.round(baseAmount * (1 - discountPercent / 100));
        discountApplied = true;
      } else {
        couponError = result.reason;
      }
    } catch {
      couponError = "Could not verify coupon";
    }
  }

  try {
    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `qa_${courseId}_${Date.now()}`,
      notes: {
        courseId,
        courseName: name,
        couponCode: discountApplied ? couponCode.trim().toUpperCase() : "",
        discountApplied: discountApplied ? "yes" : "no",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName: name,
      keyId: process.env.RAZORPAY_KEY_ID,
      baseAmount,
      finalAmount,
      discountApplied,
      discountPercent,
      couponError,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
