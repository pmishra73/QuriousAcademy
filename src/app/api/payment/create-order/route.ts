import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { variants } from "@/lib/variants";
import { courses } from "@/lib/courses";
import { validateCoupon } from "@/lib/sheets";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { courseId, couponCode } = await req.json();

  const variant = variants.find((v) => v.id === courseId);
  const course = courses.find((c) => c.id === courseId);
  const baseAmount = variant?.price ?? course?.price ?? 0;
  const name = variant?.title ?? course?.title ?? "";

  if (!baseAmount) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Apply 10% coupon discount if provided
  let finalAmount = baseAmount;
  let discountApplied = false;
  let couponError: string | undefined;

  if (couponCode?.trim()) {
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase());
      if (result.valid) {
        finalAmount = Math.round(baseAmount * 0.9);
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
      couponError,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
