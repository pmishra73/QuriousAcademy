import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/student-session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const student = await db.student.findUnique({ where: { email: email.trim() } });
  if (!student?.password) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, student.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createStudentSession(student.id);
  return NextResponse.json({ ok: true });
}
