import { put, del, list } from "@vercel/blob";
import { remark } from "remark";
import remarkHtml from "remark-html";

export type LinkedInApprovalStatus = "none" | "pending" | "approved" | "rejected";
export type LinkedInPostStatus = "idle" | "queued" | "posted" | "failed";

export type BlogMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorId: string;
  videoUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  linkedinRequested?: boolean;
  linkedinApprovalStatus?: LinkedInApprovalStatus;
  linkedinStatus?: LinkedInPostStatus;
  linkedinPostedAt?: string;
  linkedinPostUrl?: string;
  linkedinAdminNote?: string;
};

export type BlogPost = BlogMeta & { body: string };
export type BlogPostWithHtml = BlogMeta & { contentHtml: string };

const PREFIX = "blogs/";

function blobOptions() {
  // On Vercel: OIDC auto-auth via VERCEL_OIDC_TOKEN + BLOB_STORE_ID
  // Locally: falls back to BLOB_READ_WRITE_TOKEN if set
  return { storeId: process.env.BLOB_STORE_ID };
}

export async function saveBlog(post: BlogPost): Promise<string> {
  const json = JSON.stringify(post);
  const { url } = await put(`${PREFIX}${post.slug}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    ...blobOptions(),
  });
  return url;
}

export async function deleteBlog(slug: string): Promise<void> {
  const blobs = await list({ prefix: `${PREFIX}${slug}.json`, ...blobOptions() });
  for (const b of blobs.blobs) await del(b.url, blobOptions());
}

export async function getAllBlogsMeta(): Promise<BlogMeta[]> {
  const { blobs } = await list({ prefix: PREFIX, ...blobOptions() });
  const posts = await Promise.all(
    blobs.map(async (b) => {
      const res = await fetch(b.url, { next: { revalidate: 60 } });
      const post: BlogPost = await res.json();
      const { body: _, ...meta } = post;
      return meta;
    })
  );
  return posts
    .filter((p) => p.slug) // guard against malformed blobs
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getBlog(slug: string): Promise<BlogPostWithHtml | null> {
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json`, ...blobOptions() });
  if (!blobs.length) return null;

  const res = await fetch(blobs[0].url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const post: BlogPost = await res.json();

  const processed = await remark().use(remarkHtml).process(post.body);
  const { body: _, ...meta } = post;
  return { ...meta, contentHtml: processed.toString() };
}

export async function getBlogRaw(slug: string): Promise<BlogPost | null> {
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json`, ...blobOptions() });
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].url);
  if (!res.ok) return null;
  return res.json();
}
