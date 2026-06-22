import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const r = await db.resource.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && r.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["type","tag","title","description","url","blobSlug","published"]) {
    if (body[k] !== undefined) data[k] = body[k] ?? null;
  }
  const updated = await db.resource.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const r = await db.resource.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && r.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.resource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
