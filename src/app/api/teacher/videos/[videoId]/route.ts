import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { videoId } = await params;
  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && video.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.url !== undefined) data.url = body.url;
  if (body.description !== undefined) data.description = body.description;
  if (body.courseId !== undefined) data.courseId = body.courseId;
  if (body.published !== undefined) data.published = body.published;

  const updated = await db.video.update({ where: { id: videoId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { videoId } = await params;
  const userId = (session?.user as { id?: string })?.id;

  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && video.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.video.delete({ where: { id: videoId } });
  return NextResponse.json({ ok: true });
}
