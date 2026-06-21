import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveBlog, getAllBlogsMeta, type BlogPost } from "@/lib/blog-blob";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await getAllBlogsMeta();
  const posts = role === "admin" ? all : all.filter((p) => p.authorId === userId);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id!;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, excerpt, body, category, videoUrl, published } = await req.json();
  if (!slug?.trim() || !title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "slug, title and body are required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  const now = new Date().toISOString();

  const post: BlogPost = {
    slug: slug.trim(),
    title: title.trim(),
    excerpt: excerpt?.trim() ?? "",
    body: body.trim(),
    category: category?.trim() ?? "General",
    author: user?.name ?? "Unknown",
    authorId: userId,
    videoUrl: videoUrl?.trim() || undefined,
    published: published ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await saveBlog(post);
  return NextResponse.json({ ok: true, slug: post.slug }, { status: 201 });
}
