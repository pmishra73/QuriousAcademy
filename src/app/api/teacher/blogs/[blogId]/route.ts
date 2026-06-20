import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blogId } = await params;
  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  const post = await db.blogPost.findUnique({ where: { id: blogId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && post.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blogId } = await params;
  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  const post = await db.blogPost.findUnique({ where: { id: blogId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && post.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.body !== undefined) data.body = body.body;
  if (body.category !== undefined) data.category = body.category;
  if (body.published !== undefined) data.published = body.published;

  const updated = await db.blogPost.update({ where: { id: blogId }, data });
  return NextResponse.json(updated);
}
