import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await db.message.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
