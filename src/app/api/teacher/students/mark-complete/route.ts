import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCoupon } from "@/lib/coupon";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "teacher" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollmentId, studentEmail, studentPhone, studentName, courseId } = await req.json();

  const code = await createCoupon({ reason: "course_completion", completionEnrollmentId: enrollmentId });

  try {
    await sendMail({
      to: studentEmail,
      subject: `Congratulations on completing ${courseId}! Here's a reward 🎉`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Congratulations, ${studentName}! 🎉</h2>
          <p style="color:#555;line-height:1.7">
            You've successfully completed <strong>${courseId}</strong>. We're proud of your dedication and hard work.
          </p>
          <p style="color:#555;line-height:1.7">
            As a reward, here's an exclusive 10% off coupon for your next enrolment:
          </p>
          <div style="margin:28px 0;padding:20px 24px;background:#f3f4ff;border:2px dashed #5b7cfa;border-radius:10px;text-align:center">
            <div style="font-size:12px;color:#5b7cfa;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Your reward coupon</div>
            <div style="font-size:32px;font-weight:800;letter-spacing:0.15em;color:#1a1a2e">${code}</div>
            <div style="font-size:13px;color:#666;margin-top:8px">10% off · Valid for one use · Any course</div>
          </div>
          <p style="color:#555;line-height:1.7">Keep learning and growing. We look forward to seeing you in another course.</p>
          <p style="color:#aaa;font-size:12px;margin-top:28px">— The Qurious Academy Team · hello@quriousacademy.com</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Completion email failed:", err);
  }

  return NextResponse.json({ ok: true, code });
}
