import { NextRequest, NextResponse } from "next/server";
import { sendMail, ADMIN } from "@/lib/mailer";
import { courses } from "@/lib/courses";

export async function POST(req: NextRequest) {
  const { name, email, phone, course: courseId, utr } = await req.json();
  const course = courses.find((c) => c.id === courseId);

  try {
    await sendMail({
      to: ADMIN,
      subject: `New Enrollment: ${name} → ${course?.title || courseId}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0a0e1a;color:#eef2ff;padding:32px;border-radius:12px">
          <div style="margin-bottom:24px">
            <div style="font-size:24px;font-weight:700;margin-bottom:4px">New Enrollment Request</div>
            <div style="color:#9ba8c4;font-size:14px">Qurious Academy · ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          </div>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["Student Name", name],
              ["Email", email],
              ["Phone", phone],
              ["Course", course?.title || courseId],
              ["Amount", course ? `₹${course.price.toLocaleString("en-IN")}` : "—"],
              ["UTR / Transaction ID", utr],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:40%">${k}</td>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px;font-weight:500">${v}</td>
              </tr>`).join("")}
          </table>
          <div style="margin-top:24px;padding:16px;background:rgba(91,124,250,0.1);border:1px solid rgba(91,124,250,0.2);border-radius:8px;font-size:13px;color:#9ba8c4">
            Reply to the student at <a href="mailto:${email}" style="color:#5b7cfa">${email}</a>
          </div>
        </div>
      `,
    });

    await sendMail({
      to: email,
      subject: `Enrollment received — ${course?.title || courseId}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Hi ${name},</h2>
          <p style="color:#555;line-height:1.7">We've received your enrollment for <strong>${course?.title || courseId}</strong> and your UPI transaction ID <strong>${utr}</strong>.</p>
          <p style="color:#555;line-height:1.7">We'll verify and send the joining link within <strong>4 hours</strong>.</p>
          <p style="color:#555;line-height:1.7">Questions? Reply to this email.</p>
          <br/><p style="color:#555">— Qurious Academy</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
