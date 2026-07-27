import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") return false;
  return true;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const integration = await db.linkedInIntegration.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    connected: !!(integration?.accessToken && integration?.organizationUrn),
    organizationUrn: integration?.organizationUrn ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if ("organizationUrn" in body) data.organizationUrn = (body.organizationUrn as string)?.trim() || null;

  const integration = await db.linkedInIntegration.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  return NextResponse.json({ ok: true, organizationUrn: integration.organizationUrn });
}

export async function DELETE() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.linkedInIntegration.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", accessToken: null, refreshToken: null, tokenExpiresAt: null },
    update: { accessToken: null, refreshToken: null, tokenExpiresAt: null },
  });
  return NextResponse.json({ ok: true });
}
