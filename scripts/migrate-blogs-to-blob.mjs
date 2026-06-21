import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env.local") });

const AUTHOR_ID = process.env.PRASANT_USER_ID || "";
const postsDir = path.join(__dirname, "../src/content/posts");

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

console.log(`Migrating ${files.length} posts to Vercel Blob...\n`);

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);

  const post = {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    body: content.trim(),
    category: data.category,
    author: data.author ?? "Prasant Mishra",
    authorId: AUTHOR_ID,
    videoUrl: undefined,
    published: true,
    createdAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(post);
  const { url } = await put(`blogs/${slug}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  console.log(`✓ ${slug} → ${url}`);
}

console.log("\n✅ Migration complete. You can now delete src/content/posts/");
