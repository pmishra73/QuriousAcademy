import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const institutes = await db.institute.findMany({
    orderBy: { createdAt: "desc" },
    include: { teachers: { select: { id: true, name: true } } },
  });
  return NextResponse.json(institutes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, bio, logo, website } = body as Record<string, string>;

  if (!name || !slug) return NextResponse.json({ error: "name and slug are required" }, { status: 400 });

  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!clean) return NextResponse.json({ error: "invalid slug" }, { status: 400 });

  try {
    const institute = await db.institute.create({ data: { name, slug: clean, bio: bio || null, logo: logo || null, website: website || null } });
    return NextResponse.json(institute, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }
}
