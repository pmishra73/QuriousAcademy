import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { generateCouponCode } from "@/lib/coupon";
import { variants } from "@/lib/variants";

type Params = { params: Promise<{ courseId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const { status } = await req.json();

  if (!["active", "coming_soon", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const previous = await db.courseOverride.findUnique({ where: { courseId } });

  const override = await db.courseOverride.upsert({
    where: { courseId },
    update: { status, updatedAt: new Date() },
    create: { courseId, status, scheduleDates: [] },
  });

  // If activating a coming_soon course, send waitlist emails with 15% coupons
  if (status === "active" && previous?.status === "coming_soon") {
    const waitlist = await db.courseWaitlist.findMany({
      where: { courseId, notifiedAt: null },
    });

    const variant = variants.find(v => v.id === courseId);
    const courseTitle = variant?.title ?? courseId;

    for (const entry of waitlist) {
      const code = generateCouponCode();
      await db.coupon.create({
        data: { code, reason: "waitlist_activation", discount: 15, status: "unused" },
      });

      await sendMail({
        to: entry.email,
        subject: `🎉 ${courseTitle} is now live — your 15% coupon inside`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
            <h2 style="margin-bottom:8px">Hi ${entry.name},</h2>
            <p style="color:#555;line-height:1.7">
              Great news — <strong>${courseTitle}</strong> is now live on Qurious Academy!
              You were on the waitlist, so here's your exclusive 15% discount coupon:
            </p>
            <div style="margin:28px 0;padding:20px 24px;background:#f3f4ff;border:2px dashed #5b7cfa;border-radius:10px;text-align:center">
              <div style="font-size:12px;color:#5b7cfa;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Your exclusive coupon</div>
              <div style="font-size:32px;font-weight:800;letter-spacing:0.15em;color:#1a1a2e">${code}</div>
              <div style="font-size:13px;color:#666;margin-top:8px">15% off · Valid 30 days · One use only</div>
            </div>
            <p style="color:#555;line-height:1.7">Enter this code at checkout. Don't miss out — spots are limited.</p>
            <a href="https://quriousacademy.com/enroll?course=${courseId}" style="display:inline-block;margin-top:12px;background:#5b7cfa;color:white;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
              Enroll Now →
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:28px">— The Qurious Academy Team · hello@quriousacademy.com</p>
          </div>
        `,
      }).catch(console.error);

      await db.courseWaitlist.update({
        where: { id: entry.id },
        data: { notifiedAt: new Date() },
      });
    }
  }

  return NextResponse.json({ ok: true, override, waitlistNotified: status === "active" && previous?.status === "coming_soon" });
}
