import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

function adminOnly() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const VALID_STATUSES = ["confirmed", "pending", "refunded"];

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const enrollment = await db.enrollment.update({ where: { id }, data: { status } });
  return NextResponse.json(enrollment);
}
