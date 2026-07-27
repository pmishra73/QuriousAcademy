import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

function adminOnly() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();

  const q = req.nextUrl.searchParams.get("q")?.trim();

  const teachers = await db.user.findMany({
    where: {
      role: "teacher",
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, bio: true, active: true, createdAt: true, slug: true, instituteId: true },
    take: q ? 20 : undefined,
  });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") return adminOnly();

  const { name, email, password, bio, slug, instituteId } = await req.json();
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });

  const cleanSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "") : null;

  if (cleanSlug) {
    const instituteConflict = await db.institute.findUnique({ where: { slug: cleanSlug } });
    if (instituteConflict) return NextResponse.json({ error: "Slug is already used by an institute." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  try {
    const user = await db.user.create({
      data: { name, email, password: hashed, role: "teacher", bio: bio || null, slug: cleanSlug || null, instituteId: instituteId || null },
    });
    return NextResponse.json({ ok: true, id: user.id });
  } catch {
    return NextResponse.json({ error: "Slug is already taken." }, { status: 409 });
  }
}
