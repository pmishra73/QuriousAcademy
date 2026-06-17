import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current, next } = await req.json();
  if (!current || !next || next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

  const hashed = await bcrypt.hash(next, 12);
  await db.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
