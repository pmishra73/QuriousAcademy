import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { slug } = await params;
  const comments = await db.blogComment.findMany({
    where: { blogSlug: slug },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, body: true, createdAt: true },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const { name, body } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!body?.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  if (body.trim().length > 2000) return NextResponse.json({ error: "Comment must be under 2000 characters" }, { status: 400 });

  const post = await db.blogPost.findUnique({ where: { slug }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment = await db.blogComment.create({
    data: { blogSlug: slug, name: name.trim(), body: body.trim() },
    select: { id: true, name: true, body: true, createdAt: true },
  });
  return NextResponse.json(comment, { status: 201 });
}
