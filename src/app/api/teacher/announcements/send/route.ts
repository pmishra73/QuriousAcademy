import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;
  if (!userId || (role !== "teacher" && role !== "admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, subject, body } = await req.json();

  await db.announcement.create({ data: { courseId, teacherId: userId, subject, body } });

  const enrollments = await db.enrollment.findMany({
    where: { courseId, status: "confirmed" },
    select: { studentEmail: true, studentName: true },
  });

  let sent = 0;
  for (const e of enrollments) {
    try {
      await sendMail({
        to: e.studentEmail,
        subject: `[${courseId}] ${subject}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
            <p style="color:#888;font-size:12px;margin-bottom:20px">Message from your instructor at Qurious Academy</p>
            <h2 style="margin-bottom:16px">${subject}</h2>
            <div style="color:#444;line-height:1.8;font-size:14px;white-space:pre-wrap">${body}</div>
            <hr style="margin:28px 0;border:none;border-top:1px solid #eee"/>
            <p style="color:#aaa;font-size:12px">You received this because you are enrolled in <strong>${courseId}</strong>.<br/>Questions? Reply to this email or contact hello@quriousacademy.com</p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to email ${e.studentEmail}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
