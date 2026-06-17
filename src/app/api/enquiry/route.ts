import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createTransporter, FROM, ADMIN } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { type, name, email, phone, subject, body } = await req.json();

  if (!["corporate", "institute"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    await db.message.create({ data: { type, name, email, phone, subject, body } });
  } catch (err) {
    console.error("DB write failed:", err);
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM,
      to: ADMIN,
      subject: `[${type === "corporate" ? "Corporate" : "Institute"} Enquiry] ${name} — ${subject}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
          <div style="font-size:18px;font-weight:700;margin-bottom:4px">${type === "corporate" ? "🏢 Corporate" : "🎓 Institute"} Enquiry</div>
          <div style="color:#9ba8c4;font-size:13px;margin-bottom:20px">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          <table style="width:100%;border-collapse:collapse">
            ${[["Name", name], ["Email", email], ["Phone", phone ?? "—"], ["About", subject], ["Message", body]]
              .map(([k, v]) => `<tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:30%;vertical-align:top">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td>
              </tr>`).join("")}
          </table>
        </div>
      `,
    });
  } catch (err) {
    console.error("Admin email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
