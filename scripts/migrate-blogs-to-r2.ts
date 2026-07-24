/**
 * One-time migration: Vercel Blob → R2 + DB
 *
 * Run after setting R2_* env vars:
 *   npx tsx scripts/migrate-blogs-to-r2.ts
 *
 * What it does:
 *   1. Lists all blobs under blogs/ in the old Vercel Blob store
 *   2. Fetches each JSON blob
 *   3. Upserts metadata into the BlogPost DB table
 *   4. Writes the markdown body to R2
 *
 * Safe to re-run — upsert + R2 put are idempotent.
 */

import { list } from "@vercel/blob";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { putBlogBody } from "../src/lib/blog-r2";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

async function main() {
  const { blobs } = await list({ prefix: "blogs/", storeId: process.env.BLOB_STORE_ID });
  console.log(`Found ${blobs.length} blobs`);

  let ok = 0, failed = 0;

  for (const b of blobs) {
    try {
      console.log(`  url: ${b.url}`);
      console.log(`  downloadUrl: ${b.downloadUrl}`);
      const res = await fetch(b.downloadUrl, {
        headers: process.env.BLOB_READ_WRITE_TOKEN
          ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
          : {},
      });
      if (!res.ok) { console.warn(`SKIP — HTTP ${res.status}: ${await res.text().then(t => t.slice(0, 120))}`); failed++; continue; }
      const post = await res.json();
      if (!post?.slug) { console.warn(`SKIP ${b.url} — no slug`); failed++; continue; }

      await db.blogPost.upsert({
        where: { slug: post.slug },
        create: {
          slug: post.slug,
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          body: "",
          category: post.category ?? "General",
          author: post.author ?? "Unknown",
          authorId: post.authorId ?? null,
          videoUrl: post.videoUrl ?? null,
          published: post.published ?? false,
          linkedinRequested: post.linkedinRequested ?? false,
          linkedinApprovalStatus: post.linkedinApprovalStatus ?? "none",
          linkedinStatus: post.linkedinStatus ?? "idle",
          linkedinPostedAt: post.linkedinPostedAt ? new Date(post.linkedinPostedAt) : null,
          linkedinPostUrl: post.linkedinPostUrl ?? null,
          linkedinAdminNote: post.linkedinAdminNote ?? null,
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
        },
        update: {
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          category: post.category ?? "General",
          author: post.author ?? "Unknown",
          videoUrl: post.videoUrl ?? null,
          published: post.published ?? false,
          linkedinRequested: post.linkedinRequested ?? false,
          linkedinApprovalStatus: post.linkedinApprovalStatus ?? "none",
          linkedinStatus: post.linkedinStatus ?? "idle",
          linkedinPostedAt: post.linkedinPostedAt ? new Date(post.linkedinPostedAt) : null,
          linkedinPostUrl: post.linkedinPostUrl ?? null,
          linkedinAdminNote: post.linkedinAdminNote ?? null,
        },
      });

      await putBlogBody(post.slug, post.body ?? "");
      console.log(`✓ ${post.slug}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${b.url}`, e);
      failed++;
    }
  }

  console.log(`\nDone — ${ok} migrated, ${failed} failed`);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
