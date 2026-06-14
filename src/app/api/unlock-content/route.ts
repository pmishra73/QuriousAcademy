import { NextRequest, NextResponse } from "next/server";
import { createTransporter, FROM, ADMIN } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, email, phone, courseId, courseTitle } = await req.json();
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
            ${[["Name", name], ["Email", email], ["Phone", phone], ["Course", courseTitle], ["ID", courseId]]
              .map(([k, v]) => `<tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td>
              </tr>`).join("")}
          </table>
          <p style="margin-top:16px;font-size:13px;color:#9ba8c4">This lead viewed full course content. Follow up within 24 hrs.</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true }); // don't break UX over email
  }
}
