import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// One-time seed endpoint — disable after first use by removing this file
// POST /api/admin/seed  { secret: "...", name: "...", email: "...", password: "..." }
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) return NextResponse.json({ error: "SEED_SECRET not set" }, { status: 403 });

  const { secret: provided, name, email, password } = await req.json();
  if (provided !== secret) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, email, password: hashed, role: "admin" } });

  return NextResponse.json({ ok: true, id: user.id });
}
