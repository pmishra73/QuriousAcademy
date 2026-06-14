import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { variants } from "@/lib/variants";
import { courses } from "@/lib/courses";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { courseId, courseType } = await req.json();

  // Support both the old flat courses and new variants
  let amount = 0;
  let name = "";

  const variant = variants.find((v) => v.id === courseId);
  if (variant) {
    amount = variant.price;
    name = variant.title;
  } else {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      amount = course.price;
      name = course.title;
    }
  }

  if (!amount) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `qurious_${courseId}_${Date.now()}`,
      notes: {
        courseId,
        courseType: courseType || "course",
        courseName: name,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName: name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
