import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail, ADMIN } from "@/lib/mailer";
import { courses } from "@/lib/courses";

const VALID_COURSE_IDS = new Set([
  "python-masterclass", "ai-masterclass", "calculus-masterclass", "linear-algebra-masterclass",
  "python-cohort", "ai-cohort", "maths-cohort", "physics-cohort",
  "webdev-sprint", "react-sprint", "python-sprint", "dsa-sprint", "sql-sprint", "ai-tools-sprint",
  "python-deep-dive", "dsa-deep-dive", "maths-deep-dive", "backend-deep-dive", "ai-deep-dive", "genai-deep-dive", "python-standard",
  "software-engineer", "software-engineer-ii", "systems-engineer", "senior-systems-engineer",
  "ai-engineer", "genai-specialist", "senior-ai-engineer",
  "mts-i", "mts-ii", "mts-iii", "staff-software-engineer",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { name, email, phone } = await req.json();

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, email and phone are required." }, { status: 400 });
  }

  if (!VALID_COURSE_IDS.has(courseId)) {
    return NextResponse.json({ error: "Brochure not available for this course." }, { status: 404 });
  }

  const pdfUrl = `/brochures/${courseId}.pdf`;
  const course = courses.find((c) => c.id === courseId);
  const courseTitle = course?.title ?? courseId;
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  try {
    await db.lead.create({ data: { name, email, phone, courseId } });
  } catch (err) {
    console.error("Lead DB write failed:", err);
  }

  try {
    await Promise.all([
      sendMail({
        to: ADMIN,
        subject: `Brochure download: ${name} → ${courseTitle}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
            <div style="font-size:18px;font-weight:700;margin-bottom:4px">Brochure Download Lead</div>
            <div style="color:#9ba8c4;font-size:13px;margin-bottom:20px">${now} IST</div>
            <table style="width:100%;border-collapse:collapse">
              ${[["Name", name], ["Email", email], ["Phone", phone], ["Course", courseTitle]]
                .map(([k, v]) => `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:35%">${k}</td>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td>
                </tr>`).join("")}
            </table>
          </div>
        `,
      }),
      sendMail({
        to: email,
        subject: `Your ${courseTitle} brochure — Qurious Academy`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
            <h2 style="margin-bottom:8px">Hi ${name},</h2>
            <p style="color:#555;line-height:1.7">
              Here's the brochure for <strong>${courseTitle}</strong>.
              It covers the full curriculum, what you'll walk away with, and everything that's included.
            </p>
            <div style="margin:28px 0;text-align:center">
              <a href="https://quriousacademy.com${pdfUrl}" download style="display:inline-block;background:#5b7cfa;color:white;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">
                Download Brochure (PDF)
              </a>
            </div>
            <a href="https://quriousacademy.com/enroll?course=${courseId}" style="display:inline-block;background:#f3f4ff;color:#3730a3;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;border:1px solid #c7d2fe">
              Enroll in ${courseTitle} →
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:28px">— The Qurious Academy Team · hello@quriousacademy.com</p>
          </div>
        `,
      }),
    ]);
  } catch (err) {
    console.error("Email send failed:", err);
  }

  return NextResponse.json({ url: pdfUrl });
}
