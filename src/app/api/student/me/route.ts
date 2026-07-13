import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-session";

export async function GET() {
  const student = await getStudentSession();
  return NextResponse.json({ loggedIn: !!student, name: student?.name ?? null });
}
