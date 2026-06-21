import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogRaw, saveBlog, deleteBlog } from "@/lib/blog-blob";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { slug } = await params;
  const post = await getBlogRaw(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await getBlogRaw(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && existing.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = {
    ...existing,
    ...(body.title !== undefined && { title: body.title }),
    ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
    ...(body.body !== undefined && { body: body.body }),
    ...(body.category !== undefined && { category: body.category }),
    ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl || undefined }),
    ...(body.published !== undefined && { published: body.published }),
    updatedAt: new Date().toISOString(),
  };

  // If slug changed, delete old and save new
  if (body.slug && body.slug !== slug) {
    await deleteBlog(slug);
    updated.slug = body.slug;
  }

  await saveBlog(updated);
  return NextResponse.json({ ok: true, slug: updated.slug });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await getBlogRaw(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "admin" && existing.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteBlog(slug);
  return NextResponse.json({ ok: true });
}
