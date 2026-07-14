import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail, ADMIN } from "@/lib/mailer";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const approval = await db.courseApproval.findUnique({ where: { courseId } });
  return NextResponse.json({ status: approval?.status ?? "draft" });
}

export async function POST(_: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id!;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const approval = await db.courseApproval.upsert({
    where: { courseId },
    update: { status: "pending", submittedAt: new Date(), updatedAt: new Date() },
    create: { courseId, teacherId: userId, status: "pending", submittedAt: new Date() },
  });

  const teacher = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  await sendMail({
    to: ADMIN,
    subject: `Course submitted for review: ${courseId}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px">Course Pending Review</div>
      <p style="color:#9ba8c4">${teacher?.name ?? "A teacher"} has submitted <strong style="color:#eef2ff">${courseId}</strong> for review.</p>
      <a href="https://quriousacademy.com/admin/courses" style="display:inline-block;margin-top:16px;background:#5b7cfa;color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Review Course →</a>
    </div>`,
  }).catch(console.error);

  return NextResponse.json(approval);
}
