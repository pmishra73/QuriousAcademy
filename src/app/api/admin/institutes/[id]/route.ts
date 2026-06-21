import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, string | boolean>;
  const { name, slug, bio, logo, website, active } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = (slug as string).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (bio !== undefined) data.bio = bio || null;
  if (logo !== undefined) data.logo = logo || null;
  if (website !== undefined) data.website = website || null;
  if (active !== undefined) data.active = active;

  try {
    const institute = await db.institute.update({ where: { id }, data });
    return NextResponse.json(institute);
  } catch {
    return NextResponse.json({ error: "Update failed — slug may be taken" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Unlink teachers before deleting
  await db.user.updateMany({ where: { instituteId: id }, data: { instituteId: null } });
  await db.institute.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
