import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "student_session";
const SESSION_DAYS = 30;

export async function createStudentSession(studentId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.studentSession.create({ data: { token, studentId, expiresAt } });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getStudentSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.studentSession.findUnique({ where: { token }, include: { student: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.student;
}

export async function destroyStudentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.studentSession.delete({ where: { token } }).catch(() => {});
  }
  jar.delete(COOKIE_NAME);
}
