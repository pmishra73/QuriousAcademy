import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/student-session";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "A token and an 8+ character password are required." }, { status: 400 });
  }

  const invite = await db.studentInviteToken.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired or was already used." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.$transaction([
    db.student.update({ where: { id: invite.studentId }, data: { password: hashed } }),
    db.studentInviteToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  await createStudentSession(invite.studentId);
  return NextResponse.json({ ok: true });
}
