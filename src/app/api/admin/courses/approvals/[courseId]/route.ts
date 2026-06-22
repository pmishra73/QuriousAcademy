import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

type Params = { params: Promise<{ courseId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;
  const { action, adminNote } = await req.json(); // action: "approve" | "reject"

  const status = action === "approve" ? "approved" : "rejected";
  const approval = await db.courseApproval.update({
    where: { courseId },
    data: { status, adminNote: adminNote ?? null, reviewedAt: new Date(), updatedAt: new Date() },
    include: { teacher: { select: { name: true, email: true } } },
  });

  await sendMail({
    to: approval.teacher.email,
    subject: `Your course "${courseId}" has been ${status}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;padding:28px">
      <h2>Hi ${approval.teacher.name},</h2>
      <p>Your course <strong>${courseId}</strong> has been <strong>${status}</strong> by the admin.</p>
      ${adminNote ? `<div style="background:#f3f4ff;border-radius:8px;padding:14px;margin:16px 0;font-size:14px;color:#333">Admin note: ${adminNote}</div>` : ""}
      ${status === "approved"
        ? `<p>It is now live on <a href="https://quriousacademy.com/courses">quriousacademy.com/courses</a>.</p>`
        : `<p>Please review the feedback and resubmit once you've made the changes.</p>`}
    </div>`,
  }).catch(console.error);

  return NextResponse.json(approval);
}
