import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "teacher" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, title, scheduledAt, meetingLink, notes } = await req.json();
  const s = await db.session.create({
    data: { courseId, title, scheduledAt: new Date(scheduledAt), meetingLink: meetingLink || null, notes: notes || null },
  });
  return NextResponse.json({ ok: true, id: s.id });
}
