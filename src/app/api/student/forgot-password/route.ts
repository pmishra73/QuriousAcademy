import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = checkRateLimit(`forgot-pw:${ip}`, 5, 60 * 60 * 1000); // 5 attempts / hour
  if (!allowed) {
    return NextResponse.json({ ok: true }); // silently throttle — don't reveal limiting
  }

  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const student = await db.student.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Always respond with the same message to avoid user enumeration
  if (!student) {
    return NextResponse.json({ ok: true });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://quriousacademy.com";

  if (!student.password) {
    // Account exists but password was never set — resend the set-password invite link
    let existingToken = await db.studentInviteToken.findFirst({
      where: { studentId: student.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!existingToken) {
      const token = crypto.randomBytes(32).toString("hex");
      existingToken = await db.studentInviteToken.create({
        data: { token, studentId: student.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });
    }
    const setPasswordUrl = `${baseUrl}/student/set-password?token=${existingToken.token}`;
    await sendMail({
      to: student.email,
      subject: "Set up your Qurious Academy password",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Set your password</h2>
          <p style="color:#555;line-height:1.7">
            Your Qurious Academy account doesn't have a password yet. Click the button below to set one and access your dashboard.
            This link expires in 7 days.
          </p>
          <a href="${setPasswordUrl}" style="display:inline-block;margin:20px 0;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
            Set Your Password →
          </a>
          <p style="color:#aaa;font-size:12px">— The Qurious Academy Team</p>
        </div>
      `,
    }).catch(err => console.error("set-password mail failed:", err));
    return NextResponse.json({ ok: true });
  }

  // Standard password reset flow
  const token = crypto.randomBytes(32).toString("hex");
  await db.studentInviteToken.create({
    data: {
      token,
      studentId: student.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${baseUrl}/student/set-password?token=${token}`;

  await sendMail({
    to: student.email,
    subject: "Reset your Qurious Academy password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;line-height:1.7">
          We received a request to reset the password for your Qurious Academy account.
          Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
          Reset Password →
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <p style="color:#aaa;font-size:12px">— The Qurious Academy Team</p>
      </div>
    `,
  }).catch(err => console.error("reset-password mail failed:", err));

  return NextResponse.json({ ok: true });
}
