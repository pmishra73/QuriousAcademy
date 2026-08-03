/**
 * Seeds blog posts from /blogs/*.md files into the DB and uploads bodies to R2.
 *
 * The markdown files embed metadata as bold text, not YAML frontmatter:
 *   **Category:** Agentic Workflows
 *   **Read time:** 10 min
 *   **Description:** The excerpt sentence.
 *
 * Category is mapped to a canonical top-level category; the original value
 * becomes the subCategory. Run after the DB and R2 env vars are set:
 *   npx tsx scripts/seed-blogs-from-md.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
import path from "path";
import fs from "fs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { putBlogBody } from "../src/lib/blog-r2";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

const BLOGS_DIR = path.join(process.cwd(), "blogs");

// Map sub-category labels → canonical top-level category
const CATEGORY_MAP: Record<string, string> = {
  "Agentic Workflows":        "AI & ML",
  "RAG & Evaluation":         "AI & ML",
  "Vector Databases":         "AI & ML",
  "Graph Databases":          "AI & ML",
  "Search":                   "Technology",
  "Backend":                  "Programming",
  "API Design":               "Programming",
  "Performance":              "Programming",
  "Machine Learning":         "AI & ML",
  "Deep Learning":            "AI & ML",
  "Data Science":             "AI & ML",
  "Mathematics":              "Mathematics",
  "Science":                  "Science",
  "Python":                   "Programming",
  "Programming":              "Programming",
  "Technology":               "Technology",
  "AI & ML":                  "AI & ML",
};

function toCanonicalCategory(raw: string): string {
  return CATEGORY_MAP[raw] ?? "Technology";
}

function parseBlogMd(content: string, filename: string): {
  slug: string; title: string; category: string; subCategory?: string; excerpt: string; body: string;
} {
  const slug = path.basename(filename, ".md");
  const lines = content.split("\n");

  let title = "";
  let rawCategory = "";
  let excerpt = "";
  const metaLines = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim();
      metaLines.add(i);
      continue;
    }

    const catMatch = line.match(/^\*\*Category:\*\*\s*(.+)/);
    if (catMatch) { rawCategory = catMatch[1].trim(); metaLines.add(i); continue; }

    const descMatch = line.match(/^\*\*Description:\*\*\s*(.+)/);
    if (descMatch) { excerpt = descMatch[1].trim(); metaLines.add(i); continue; }

    if (/^\*\*Read time:\*\*/.test(line)) { metaLines.add(i); continue; }
  }

  const body = lines
    .filter((_, i) => !metaLines.has(i))
    .join("\n")
    .replace(/^\n+/, "")
    .trim();

  const category = toCanonicalCategory(rawCategory);
  const subCategory = rawCategory && rawCategory !== category ? rawCategory : undefined;

  return { slug, title, category, subCategory, excerpt, body };
}

async function main() {
  const admin = await db.user.findFirst({
    where: { role: "admin" },
    select: { id: true, name: true },
  });

  if (!admin) {
    console.error("No admin user found. Run the seed endpoint first.");
    process.exit(1);
  }

  console.log(`Seeding as: ${admin.name} (${admin.id})\n`);

  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".md"));
  if (!files.length) {
    console.log("No .md files found in blogs/");
    process.exit(0);
  }

  let ok = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(BLOGS_DIR, file), "utf-8");
      const { slug, title, category, subCategory, excerpt, body } = parseBlogMd(content, file);

      await db.blogPost.upsert({
        where: { slug },
        create: {
          slug,
          title,
          excerpt,
          body: "",
          category,
          subCategory: subCategory ?? null,
          author: admin.name,
          authorId: admin.id,
          published: true,
        },
        update: {
          title,
          excerpt,
          category,
          subCategory: subCategory ?? null,
          author: admin.name,
          authorId: admin.id,
          published: true,
        },
      });

      await putBlogBody(slug, body);
      console.log(`✓  ${slug}  [${category}${subCategory ? ` › ${subCategory}` : ""}]`);
      ok++;
    } catch (e) {
      console.error(`✗  ${file}`, e);
      failed++;
    }
  }

  console.log(`\nDone — ${ok} seeded, ${failed} failed`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
