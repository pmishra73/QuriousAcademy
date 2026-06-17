import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCouponCode } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, phone } = await req.json();

  const code = generateCouponCode();
  await db.coupon.create({
    data: { code, reason: "promotional", discount: 10, status: "unused" },
  });

  // TODO: send email/SMS to recipient
  console.log(`Promotional coupon ${code} generated for ${email} ${phone}`);

  return NextResponse.json({ code });
}
