import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { sendMail, ADMIN } from "@/lib/mailer";
import { variants } from "@/lib/variants";
import { courses } from "@/lib/courses";
import { db } from "@/lib/db";
import { markCouponUsed } from "@/lib/coupon";
import { escHtml } from "@/lib/html-escape";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

async function linkStudentAndGetSetPasswordUrl(email: string, name: string): Promise<string | null> {
  const existing = await db.student.findUnique({ where: { email } });
  const student = existing ?? (await db.student.create({ data: { email, name } }));

  if (student.password) {
    await db.enrollment.updateMany({ where: { studentEmail: email, studentId: null }, data: { studentId: student.id } });
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.studentInviteToken.create({
    data: { token, studentId: student.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  await db.enrollment.updateMany({ where: { studentEmail: email, studentId: null }, data: { studentId: student.id } });
  return `https://quriousacademy.com/student/set-password?token=${token}`;
}

export async function POST(req: NextRequest) {
  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    studentName, studentEmail, studentPhone, courseId,
    couponCode, finalAmount, discountPercent, batchDate,
  } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // Re-fetch the order from Razorpay to get the authoritative paid amount.
  // This prevents client-supplied finalAmount / discountPercent from polluting accounting records.
  let authorizedAmount: number;
  let confirmedCoupon: string;
  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);
    authorizedAmount = Math.round((order.amount as number) / 100); // paise → rupees
    const notes = (order.notes ?? {}) as Record<string, string>;
    confirmedCoupon = notes.couponCode?.trim().toUpperCase() ?? "";
  } catch {
    // Razorpay re-fetch failed — fall back to client value but log it
    console.error("Razorpay order re-fetch failed; falling back to client-supplied amount");
    authorizedAmount = finalAmount ?? 0;
    confirmedCoupon = couponCode?.trim().toUpperCase() ?? "";
  }

  const variant = variants.find((v) => v.id === courseId);
  const course = courses.find((c) => c.id === courseId);
  const courseName = variant?.title ?? course?.title ?? courseId;
  const basePrice = variant?.price ?? course?.price ?? 0;
  const paidAmount = authorizedAmount;
  const appliedDiscount: number =
    basePrice > 0 && paidAmount < basePrice
      ? Math.round((1 - paidAmount / basePrice) * 100)
      : 0;

  let setPasswordUrl: string | null = null;
  try {
    const enrollment = await db.enrollment.create({
      data: {
        courseId,
        studentName,
        studentEmail,
        studentPhone,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid: Math.round(paidAmount * 100),
        discountApplied: appliedDiscount,
        status: "confirmed",
        couponCode: confirmedCoupon || undefined,
        batchDate: batchDate || undefined,
      },
    });
    if (confirmedCoupon) {
      await markCouponUsed(confirmedCoupon, enrollment.id);
    }
    setPasswordUrl = await linkStudentAndGetSetPasswordUrl(studentEmail, studentName);
  } catch (err) {
    console.error("DB write failed:", err);
  }

  const discountLabel = appliedDiscount > 0 ? `${appliedDiscount}% off with ${confirmedCoupon}` : null;

  try {
    await sendMail({
      to: ADMIN,
      subject: `✅ Payment confirmed: ${studentName} → ${courseName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
          <div style="font-size:18px;font-weight:700;margin-bottom:4px;color:#34d399">✅ Payment Confirmed</div>
          <div style="color:#9ba8c4;font-size:13px;margin-bottom:20px">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["Student", escHtml(studentName)],
              ["Email", escHtml(studentEmail)],
              ["Phone", escHtml(studentPhone)],
              ["Course", escHtml(courseName)],
              ["Batch", escHtml(batchDate || "—")],
              ["Amount Paid", `₹${paidAmount.toLocaleString("en-IN")}${discountLabel ? ` (${escHtml(discountLabel)})` : ""}`],
              ["Payment ID", escHtml(razorpay_payment_id)],
              ["Order ID", escHtml(razorpay_order_id)],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px;font-weight:500">${v}</td>
              </tr>`).join("")}
          </table>
        </div>
      `,
    });

    await sendMail({
      to: studentEmail,
      subject: `You're enrolled — ${courseName} 🎉`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Hi ${escHtml(studentName)},</h2>
          <p style="color:#555;line-height:1.7">
            Your payment of <strong>₹${paidAmount.toLocaleString("en-IN")}</strong> for <strong>${escHtml(courseName)}</strong> has been confirmed.
            ${discountLabel ? `<br/><span style="color:#5b7cfa">${escHtml(discountLabel.charAt(0).toUpperCase() + discountLabel.slice(1))} was applied.</span>` : ""}
          </p>
          ${batchDate ? `<p style="color:#555;line-height:1.7">Your batch: <strong>${escHtml(batchDate)}</strong></p>` : ""}
          <p style="color:#555;line-height:1.7">
            We'll send you the class joining link, schedule details, and any pre-read material within the next few hours.
          </p>
          ${setPasswordUrl ? `
          <p style="color:#555;line-height:1.7">
            Create your account to access your course dashboard and start learning:
          </p>
          <a href="${setPasswordUrl}" style="display:inline-block;margin:8px 0 20px;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
            Set Up Your Account →
          </a>` : `
          <a href="https://quriousacademy.com/dashboard" style="display:inline-block;margin:8px 0 20px;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
            Go to Your Dashboard →
          </a>`}
          <div style="margin:16px 0;padding:16px 20px;background:#f7f7f7;border-radius:8px;font-size:13px;color:#666">
            <div>Payment ID: <strong>${escHtml(razorpay_payment_id)}</strong></div>
            <div>Order ID: <strong>${escHtml(razorpay_order_id)}</strong></div>
          </div>
          <p style="color:#555;line-height:1.7">Questions? Reply to this email — we respond within a few hours.</p>
          <br/><p style="color:#555">— The Qurious Academy Team</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Email send failed (payment still confirmed):", emailErr);
  }

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id });
}
