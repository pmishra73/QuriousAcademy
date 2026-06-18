import { NextRequest, NextResponse } from "next/server";
import { sendMail, ADMIN } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, experience, bio, portfolio } = await req.json();

  try {
    await sendMail({
      to: ADMIN,
      subject: `New Instructor Application: ${name} — ${subject}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0a0e1a;color:#eef2ff;padding:32px;border-radius:12px">
          <div style="margin-bottom:24px">
            <div style="font-size:22px;font-weight:700;margin-bottom:4px">New Instructor Application</div>
            <div style="color:#9ba8c4;font-size:13px">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          </div>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["Name", name], ["Email", email], ["Phone", phone],
              ["Subject", subject], ["Experience", experience],
              ["Portfolio", portfolio || "Not provided"],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td>
              </tr>`).join("")}
          </table>
          <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.04);border-radius:8px">
            <div style="font-size:12px;color:#9ba8c4;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em">Bio</div>
            <p style="font-size:14px;line-height:1.7">${bio}</p>
          </div>
          <div style="margin-top:16px;font-size:13px;color:#9ba8c4">
            Reply to applicant: <a href="mailto:${email}" style="color:#5b7cfa">${email}</a>
          </div>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
