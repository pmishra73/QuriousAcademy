import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail, ADMIN } from "@/lib/mailer";

type Params = { params: Promise<{ courseId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  // Check course exists and is coming_soon
  const override = await db.courseOverride.findUnique({ where: { courseId } });
  if (override?.status === "hidden") {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  try {
    await db.courseWaitlist.create({
      data: { id: `${courseId}-${email}-${Date.now()}`.replace(/[^a-z0-9]/gi, "").slice(0, 30), courseId, name: name.trim(), email: email.trim() },
    });
  } catch {
    // Already on waitlist — silently succeed
  }

  const variant = (await import("@/lib/variants")).variants.find(v => v.id === courseId);
  const courseTitle = variant?.title ?? courseId;

  // Confirm to user
  await sendMail({
    to: email.trim(),
    subject: `You're on the waitlist — ${courseTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="margin-bottom:8px">Hi ${name},</h2>
        <p style="color:#555;line-height:1.7">
          You're on the waitlist for <strong>${courseTitle}</strong>. We'll email you the moment it goes live — with a <strong>15% discount</strong> reserved just for you.
        </p>
        <div style="margin:24px 0;padding:18px 22px;background:#f3f4ff;border-left:4px solid #5b7cfa;border-radius:6px;font-size:14px;color:#333">
          Your 15% coupon will be sent automatically when the course launches. No action needed.
        </div>
        <p style="color:#888;font-size:13px">— The Qurious Academy Team · hello@quriousacademy.com</p>
      </div>
    `,
  }).catch(console.error);

  // Notify admin
  await sendMail({
    to: ADMIN,
    subject: `Waitlist signup: ${name} → ${courseTitle}`,
    html: `<div style="font-family:system-ui,sans-serif;background:#0a0e1a;color:#eef2ff;padding:24px;border-radius:10px;max-width:480px"><b>${name}</b> (${email}) joined the waitlist for <b>${courseTitle}</b>.</div>`,
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
