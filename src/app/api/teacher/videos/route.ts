import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  const videos = role === "admin"
    ? await db.video.findMany({ orderBy: { createdAt: "desc" }, include: { teacher: { select: { name: true } } } })
    : await db.video.findMany({ where: { teacherId: userId }, orderBy: { createdAt: "desc" }, include: { teacher: { select: { name: true } } } });

  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, title, url, description, published } = await req.json();
  if (!courseId?.trim() || !title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "courseId, title and url are required" }, { status: 400 });
  }

  const userId = (session.user as { id?: string })?.id!;
  const user = await db.user.findUnique({ where: { id: userId }, select: { instituteId: true } });

  const video = await db.video.create({
    data: {
      courseId: courseId.trim(),
      teacherId: userId,
      instituteId: user?.instituteId ?? null,
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() ?? null,
      published: published ?? false,
    },
  });
  return NextResponse.json(video, { status: 201 });
}
