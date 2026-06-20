import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  const posts = role === "admin"
    ? await db.blogPost.findMany({ orderBy: { createdAt: "desc" } })
    : await db.blogPost.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" } });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, excerpt, body, category, published } = await req.json();
  if (!slug?.trim() || !title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "slug, title and body are required" }, { status: 400 });
  }

  const post = await db.blogPost.create({
    data: {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt?.trim() ?? "",
      body: body.trim(),
      category: category?.trim() ?? "General",
      author: session.user?.name ?? "Unknown",
      authorId: (session.user as { id?: string })?.id ?? null,
      published: published ?? false,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
