import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const approvals = await db.courseApproval.findMany({
    orderBy: { updatedAt: "desc" },
    include: { teacher: { select: { name: true, email: true } } },
  });
  return NextResponse.json(approvals);
}
