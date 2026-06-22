import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCourseContent, saveCourseContent, emptyCourseContent } from "@/lib/course-content";
import { db } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;
  const content = await getCourseContent(courseId) ?? emptyCourseContent(courseId);
  return NextResponse.json(content);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id!;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  // Ensure CourseApproval record exists
  await db.courseApproval.upsert({
    where: { courseId },
    update: { updatedAt: new Date() },
    create: { courseId, teacherId: userId, status: "draft" },
  });

  const content = await req.json();
  content.courseId = courseId;
  const url = await saveCourseContent(content);
  return NextResponse.json({ ok: true, url });
}
