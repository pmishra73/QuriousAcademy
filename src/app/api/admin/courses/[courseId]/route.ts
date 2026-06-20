import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMergedVariants } from "@/lib/courseOverrides";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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
