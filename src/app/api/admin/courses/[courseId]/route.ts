import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMergedVariants } from "@/lib/courseOverrides";
import { auth } from "@/lib/auth";

function adminOnly() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { courseId } = await params;
  const all = await getMergedVariants();
  const variant = all.find((v) => v.id === courseId);
  if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(variant);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { courseId } = await params;
  const fields = await req.json();

  const allowed = ["hidden", "title", "tagline", "price", "recordedPrice", "level", "scheduleDates"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in fields) data[key] = fields[key];
  }

  const result = await db.courseOverride.upsert({
    where: { courseId },
    create: { courseId, ...data } as Parameters<typeof db.courseOverride.create>[0]["data"],
    update: data,
  });

  return NextResponse.json(result);
}
