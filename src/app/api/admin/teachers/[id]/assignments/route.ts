import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

function adminOnly() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { id } = await params;
  const assignments = await db.courseAssignment.findMany({ where: { teacherId: id } });
  return NextResponse.json(assignments.map((a) => a.courseId));
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { id } = await params;
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });
  const existing = await db.courseAssignment.findFirst({ where: { teacherId: id, courseId } });
  if (existing) return NextResponse.json({ ok: true, id: existing.id });
  const a = await db.courseAssignment.create({ data: { teacherId: id, courseId } });
  return NextResponse.json({ ok: true, id: a.id });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { id } = await params;
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });
  await db.courseAssignment.deleteMany({ where: { teacherId: id, courseId } });
  return NextResponse.json({ ok: true });
}
