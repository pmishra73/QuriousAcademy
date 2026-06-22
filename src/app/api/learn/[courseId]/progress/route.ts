import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

// GET: fetch all lesson progress for a student in a course
export async function GET(req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const progress = await db.lessonProgress.findMany({ where: { studentEmail: email, courseId } });
  return NextResponse.json(progress);
}

// POST: mark a lesson complete/incomplete
export async function POST(req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const { email, lessonId, completed } = await req.json();
  if (!email || !lessonId) return NextResponse.json({ error: "email and lessonId required" }, { status: 400 });
  const record = await db.lessonProgress.upsert({
    where: { studentEmail_courseId_lessonId: { studentEmail: email, courseId, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { id: `${email}-${courseId}-${lessonId}`.replace(/[^a-z0-9]/gi, "").slice(0, 30) + Date.now(), studentEmail: email, courseId, lessonId, completed, completedAt: completed ? new Date() : null },
  });
  return NextResponse.json(record);
}
