import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.courseWaitlist.groupBy({
    by: ["courseId"],
    where: { notifiedAt: null },
    _count: { id: true },
  });
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.courseId] = r._count.id;
  return NextResponse.json(counts);
}
