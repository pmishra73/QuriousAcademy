import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teacher = await db.user.findUnique({ where: { id, role: "teacher" } });
  if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _password, ...safe } = teacher;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("bio" in body) data.bio = body.bio || null;
  if ("photo" in body) data.photo = body.photo || null;
  if ("active" in body) data.active = body.active;
  if ("instituteId" in body) data.instituteId = body.instituteId || null;
  if ("slug" in body) {
    const s = body.slug as string;
    data.slug = s ? s.toLowerCase().replace(/[^a-z0-9-]/g, "") : null;
  }
  if ("password" in body && typeof body.password === "string" && body.password.trim()) {
    data.password = await bcrypt.hash(body.password.trim(), 12);
  }

  try {
    const user = await db.user.update({ where: { id }, data });
    return NextResponse.json({ ok: true, id: user.id });
  } catch {
    return NextResponse.json({ error: "Update failed — slug may be taken" }, { status: 409 });
  }
}
