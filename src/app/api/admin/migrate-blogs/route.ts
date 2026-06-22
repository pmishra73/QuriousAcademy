import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PRASANT_ID = "cmqip11ye000010n48mku05n0";
const SECRET = process.env.SEED_SECRET;

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!secret || secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postsDir = path.join(process.cwd(), "src/content/posts");
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const results: string[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);

    const post = {
      slug,
      title: data.title,
      excerpt: data.excerpt ?? "",
      body: content.trim(),
      category: data.category ?? "General",
      author: data.author ?? "Prasant Mishra",
      authorId: PRASANT_ID,
      videoUrl: undefined,
      published: true,
      createdAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { url } = await put(`blogs/${slug}.json`, JSON.stringify(post), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      storeId: process.env.BLOB_STORE_ID,
    });

    results.push(`${slug} → ${url}`);
  }

  return NextResponse.json({ ok: true, migrated: results });
}
