import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCouponCode } from "@/lib/coupon";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, phone, courseId } = await req.json();

  const code = generateCouponCode();
  await db.coupon.create({
    data: { code, reason: "promotional", discount: 10, status: "unused" },
  });

  // Send coupon to recipient
  if (email) {
    const enrollLink = courseId
      ? `https://quriousacademy.com/enroll?course=${courseId}`
      : "https://quriousacademy.com/courses";
    await sendMail({
      to: email,
      subject: "Your exclusive 10% discount — Qurious Academy",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Hi there,</h2>
          <p style="color:#555;line-height:1.7">
            Here's an exclusive 10% discount coupon on any Qurious Academy course — just for you.
          </p>
          <div style="margin:28px 0;padding:20px 24px;background:#f3f4ff;border:2px dashed #5b7cfa;border-radius:10px;text-align:center">
            <div style="font-size:12px;color:#5b7cfa;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Your coupon code</div>
            <div style="font-size:32px;font-weight:800;letter-spacing:0.15em;color:#1a1a2e">${code}</div>
            <div style="font-size:13px;color:#666;margin-top:8px">10% off · Valid for one use only</div>
          </div>
          <p style="color:#555;line-height:1.7">
            Enter this code at checkout when you're ready to enroll.
          </p>
          <a href="${enrollLink}" style="display:inline-block;margin-top:12px;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">
            Browse courses →
          </a>
          <p style="color:#999;font-size:12px;margin-top:28px">This coupon can only be used once.</p>
          <p style="color:#aaa;font-size:12px">— The Qurious Academy Team · hello@quriousacademy.com</p>
        </div>
      `,
    }).catch(err => console.error("Coupon email failed:", err));
  } else {
    console.log(`Promotional coupon ${code} generated for ${phone ?? "unknown"} — no email provided`);
  }

  return NextResponse.json({ code });
}
