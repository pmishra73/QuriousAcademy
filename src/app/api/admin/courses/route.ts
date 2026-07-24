import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMergedVariants } from "@/lib/courseOverrides";
import { auth } from "@/lib/auth";

function adminOnly() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const variants = await getMergedVariants();
  return NextResponse.json(variants);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();
  const { courseId, ...fields } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const allowed = ["status", "title", "tagline", "price", "recordedPrice", "level", "scheduleDates"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in fields) data[key] = fields[key];
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const result = await db.courseOverride.upsert({
    where: { courseId },
    create: { courseId, ...data } as Parameters<typeof db.courseOverride.create>[0]["data"],
    update: data,
  });

  return NextResponse.json(result);
}
