import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code?.trim()) {
    return NextResponse.json({ valid: false, reason: "No code provided" }, { status: 400 });
  }
  try {
    const result = await validateCoupon(code.trim().toUpperCase());
    return NextResponse.json(result);
  } catch (err) {
    console.error("Coupon validate error:", err);
    return NextResponse.json({ valid: false, reason: "Could not verify coupon right now" }, { status: 500 });
  }
}
