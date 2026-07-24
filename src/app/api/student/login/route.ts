import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/student-session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000); // 5 attempts / 15 min
  if (!allowed) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

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
