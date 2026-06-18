import { NextRequest, NextResponse } from "next/server";
import { createTransporter, FROM, ADMIN } from "@/lib/mailer";
import { db } from "@/lib/db";
import { createCoupon } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const { name, email, phone, courseId, courseTitle } = await req.json();

  // Save lead + coupon to DB (best-effort)
  let couponCode = "";
  try {
    const lead = await db.lead.create({ data: { name, email, phone, courseId } });
    couponCode = await createCoupon({ reason: "syllabus_unlock", leadId: lead.id });
  } catch (err) {
    console.error("DB write failed:", err);
    // Generate code in-memory so email still sends
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    couponCode = `QA-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: FROM,
      to: ADMIN,
      subject: `Content unlock lead: ${name} → ${courseTitle}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
          <div style="font-size:18px;font-weight:700;margin-bottom:4px">Course Content Unlock</div>
          <div style="color:#9ba8c4;font-size:13px;margin-bottom:20px">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          <table style="width:100%;border-collapse:collapse">
            ${[["Name", name], ["Email", email], ["Phone", phone], ["Course", courseTitle], ["Coupon", couponCode]]
              .map(([k, v]) => `<tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td>
              </tr>`).join("")}
          </table>
        </div>
      `,
    });

    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Your 10% off coupon for ${courseTitle} — Qurious Academy`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Hi ${name},</h2>
          <p style="color:#555;line-height:1.7">
            Thanks for checking out <strong>${courseTitle}</strong>. Here's a 10% discount coupon — just for you.
          </p>
          <div style="margin:28px 0;padding:20px 24px;background:#f3f4ff;border:2px dashed #5b7cfa;border-radius:10px;text-align:center">
            <div style="font-size:12px;color:#5b7cfa;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Your coupon code</div>
            <div style="font-size:32px;font-weight:800;letter-spacing:0.15em;color:#1a1a2e">${couponCode}</div>
            <div style="font-size:13px;color:#666;margin-top:8px">10% off · Valid for one use only</div>
          </div>
          <p style="color:#555;line-height:1.7">
            Enter this code at checkout on the enroll page. The discount will be applied automatically.
          </p>
          <a href="https://quriousacademy.com/enroll?course=${courseId}" style="display:inline-block;margin-top:12px;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
            Enroll now →
          </a>
          <p style="color:#999;font-size:12px;margin-top:28px">
            This coupon is personal to you and can only be used once. If you have questions, reply to this email.
          </p>
          <p style="color:#aaa;font-size:12px">— The Qurious Academy Team · hello@quriousacademy.com</p>
        </div>
      `,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Email send failed:", msg, "| EMAIL_FROM:", process.env.EMAIL_FROM, "| PASS set:", !!process.env.EMAIL_PASS);
  }

  return NextResponse.json({ ok: true, couponCode });
}
