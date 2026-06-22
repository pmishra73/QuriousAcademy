import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resources = role === "admin"
    ? await db.resource.findMany({ orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true } } } })
    : await db.resource.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true } } } });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id!;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type, tag, title, description, url, blobSlug, published } = await req.json();
  if (!type || !title?.trim()) return NextResponse.json({ error: "type and title required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: userId }, select: { instituteId: true } });
  const resource = await db.resource.create({
    data: { type, tag: tag ?? null, title: title.trim(), description: description?.trim() ?? null, ownerId: userId, instituteId: user?.instituteId ?? null, url: url?.trim() ?? null, blobSlug: blobSlug?.trim() ?? null, published: published ?? false },
  });
  return NextResponse.json(resource, { status: 201 });
}
