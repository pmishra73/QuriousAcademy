import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "teacher" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, title, url, type } = await req.json();
  const r = await db.resource.create({ data: { courseId, title, url, type } });
  return NextResponse.json({ ok: true, id: r.id });
}
