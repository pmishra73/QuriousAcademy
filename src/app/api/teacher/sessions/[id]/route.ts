import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

async function authorizeSession(sessionId: string) {
  const staffSession = await auth();
  const role = (staffSession?.user as { role?: string })?.role;
  const userId = (staffSession?.user as { id?: string })?.id;
  if (role !== "teacher" && role !== "admin") return { error: "Unauthorized", status: 401 };

  const s = await db.session.findUnique({ where: { id: sessionId } });
  if (!s) return { error: "Not found", status: 404 };

  if (role === "teacher") {
    if (!userId) return { error: "Unauthorized", status: 401 };
    const assignment = await db.courseAssignment.findFirst({ where: { teacherId: userId, courseId: s.courseId } });
    if (!assignment) return { error: "Forbidden", status: 403 };
  }

  return { session: s, role };
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await authorizeSession(id);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { title, scheduledAt, meetingLink, notes, status } = await req.json();
  const updated = await db.session.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
      ...(meetingLink !== undefined && { meetingLink: meetingLink || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(status !== undefined && { status }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await authorizeSession(id);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await db.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
