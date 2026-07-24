import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/student-session";

type Params = { params: Promise<{ courseId: string }> };

// GET: fetch all lesson progress for the authenticated student in a course
export async function GET(req: NextRequest, { params }: Params) {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const progress = await db.lessonProgress.findMany({ where: { studentEmail: student.email, courseId } });
  return NextResponse.json(progress);
}

// POST: mark a lesson complete/incomplete for the authenticated student
export async function POST(req: NextRequest, { params }: Params) {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const enrollment = await db.enrollment.findFirst({
    where: { courseId, status: "confirmed", OR: [{ studentId: student.id }, { studentEmail: student.email }] },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const { lessonId, completed } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const email = student.email;
  const record = await db.lessonProgress.upsert({
    where: { studentEmail_courseId_lessonId: { studentEmail: email, courseId, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { id: `${email}-${courseId}-${lessonId}`.replace(/[^a-z0-9]/gi, "").slice(0, 30) + Date.now(), studentEmail: email, courseId, lessonId, completed, completedAt: completed ? new Date() : null },
  });
  return NextResponse.json(record);
}
