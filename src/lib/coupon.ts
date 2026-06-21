import { db } from "./db";

export function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `QA-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

export async function createCoupon(opts: {
  reason: "syllabus_unlock" | "course_completion" | "promotional" | "content_edit_thanks";
  leadId?: string;
  completionEnrollmentId?: string;
  discount?: number;
}): Promise<string> {
  const code = generateCouponCode();
  await db.coupon.create({
    data: {
      code,
      reason: opts.reason,
      discount: opts.discount ?? 10,
      status: "unused",
      leadId: opts.leadId,
      completionEnrollmentId: opts.completionEnrollmentId,
    },
  });
  return code;
}

export async function validateCoupon(code: string): Promise<{ valid: boolean; reason?: string; discount?: number }> {
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { valid: false, reason: "Coupon not found" };
  if (coupon.status === "used") return { valid: false, reason: "Coupon already used" };
  if (coupon.status === "revoked") return { valid: false, reason: "Coupon has been revoked" };
  return { valid: true, discount: coupon.discount };
}

export async function markCouponUsed(code: string, enrollmentId: string): Promise<void> {
  await db.coupon.update({
    where: { code },
    data: { status: "used", usedAt: new Date(), usedByEnrollmentId: enrollmentId },
  });
}
