import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createTransporter, FROM, ADMIN } from "@/lib/mailer";
import { variants } from "@/lib/variants";
import { courses } from "@/lib/courses";

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentName, studentEmail, studentPhone, courseId } = await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // Look up course details
  const variant = variants.find((v) => v.id === courseId);
  const course = courses.find((c) => c.id === courseId);
  const courseName = variant?.title ?? course?.title ?? courseId;
  const price = variant?.price ?? course?.price ?? 0;

  // Send confirmation emails
  const transporter = createTransporter();

  try {
    // Email to admin
    await transporter.sendMail({
      from: FROM,
      to: ADMIN,
      subject: `✅ Payment confirmed: ${studentName} → ${courseName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
          <div style="font-size:18px;font-weight:700;margin-bottom:4px;color:#34d399">✅ Payment Confirmed</div>
          <div style="color:#9ba8c4;font-size:13px;margin-bottom:20px">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["Student", studentName],
              ["Email", studentEmail],
              ["Phone", studentPhone],
              ["Course", courseName],
              ["Amount Paid", `₹${price.toLocaleString("en-IN")}`],
              ["Payment ID", razorpay_payment_id],
              ["Order ID", razorpay_order_id],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px;font-weight:500">${v}</td>
              </tr>`).join("")}
          </table>
          <div style="margin-top:16px;padding:14px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:8px;font-size:13px;color:#9ba8c4">
            Payment verified by Razorpay. Send the student the class joining link at <a href="mailto:${studentEmail}" style="color:#5b7cfa">${studentEmail}</a>
          </div>
        </div>
      `,
    });

    // Confirmation email to student
    await transporter.sendMail({
      from: FROM,
      to: studentEmail,
      subject: `You're enrolled — ${courseName} 🎉`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Hi ${studentName},</h2>
          <p style="color:#555;line-height:1.7">
            Your payment of <strong>₹${price.toLocaleString("en-IN")}</strong> for <strong>${courseName}</strong> has been confirmed.
          </p>
          <p style="color:#555;line-height:1.7">
            We'll send you the class joining link, schedule details, and any pre-read material within the next few hours.
          </p>
          <div style="margin:24px 0;padding:16px 20px;background:#f7f7f7;border-radius:8px;font-size:13px;color:#666">
            <div>Payment ID: <strong>${razorpay_payment_id}</strong></div>
            <div>Order ID: <strong>${razorpay_order_id}</strong></div>
          </div>
          <p style="color:#555;line-height:1.7">Questions? Reply to this email — we respond within a few hours.</p>
          <br/>
          <p style="color:#555">— The Qurious Academy Team</p>
        </div>
      `,
    });
  } catch (emailErr) {
    // Payment is verified — don't fail the response over email issues
    console.error("Email send failed (payment still confirmed):", emailErr);
  }

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id });
}
