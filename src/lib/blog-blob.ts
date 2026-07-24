import { remark } from "remark";
import remarkHtml from "remark-html";
import { db } from "@/lib/db";
import { putBlogBody, getBlogBody, deleteBlogBody } from "@/lib/blog-r2";

export type LinkedInApprovalStatus = "none" | "pending" | "approved" | "rejected";
export type LinkedInPostStatus = "idle" | "posted" | "failed";

export type BlogMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorId: string;
  videoUrl?: string;
  imageUrl?: string;
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

function toMeta(p: {
  slug: string; title: string; excerpt: string; category: string;
  author: string; authorId: string | null; videoUrl: string | null;
  imageUrl: string | null;
  published: boolean; createdAt: Date; updatedAt: Date;
  linkedinRequested: boolean; linkedinApprovalStatus: string;
  linkedinStatus: string; linkedinPostedAt: Date | null;
  linkedinPostUrl: string | null; linkedinAdminNote: string | null;
}): BlogMeta {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    author: p.author,
    authorId: p.authorId ?? "",
    videoUrl: p.videoUrl ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    published: p.published,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    linkedinRequested: p.linkedinRequested,
    linkedinApprovalStatus: p.linkedinApprovalStatus as LinkedInApprovalStatus,
    linkedinStatus: p.linkedinStatus as LinkedInPostStatus,
    linkedinPostedAt: p.linkedinPostedAt?.toISOString(),
    linkedinPostUrl: p.linkedinPostUrl ?? undefined,
    linkedinAdminNote: p.linkedinAdminNote ?? undefined,
  };
}

const META_SELECT = {
  slug: true, title: true, excerpt: true, category: true,
  author: true, authorId: true, videoUrl: true, imageUrl: true, published: true,
  createdAt: true, updatedAt: true,
  linkedinRequested: true, linkedinApprovalStatus: true,
  linkedinStatus: true, linkedinPostedAt: true,
  linkedinPostUrl: true, linkedinAdminNote: true,
} as const;

export async function getAllBlogsMeta(): Promise<BlogMeta[]> {
  const rows = await db.blogPost.findMany({
    select: META_SELECT,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toMeta);
}

export async function getBlog(slug: string): Promise<BlogPostWithHtml | null> {
  const row = await db.blogPost.findUnique({ where: { slug }, select: META_SELECT });
  if (!row) return null;
  const body = (await getBlogBody(slug)) ?? "";
  const contentHtml = (await remark().use(remarkHtml, { sanitize: false }).process(body)).toString();
  return { ...toMeta(row), contentHtml };
}

export async function getBlogRaw(slug: string): Promise<BlogPost | null> {
  const row = await db.blogPost.findUnique({ where: { slug }, select: META_SELECT });
  if (!row) return null;
  const body = (await getBlogBody(slug)) ?? "";
  return { ...toMeta(row), body };
}

export async function saveBlog(post: BlogPost): Promise<string> {
  const data = {
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    authorId: post.authorId || null,
    videoUrl: post.videoUrl ?? null,
    imageUrl: post.imageUrl ?? null,
    published: post.published,
    linkedinRequested: post.linkedinRequested ?? false,
    linkedinApprovalStatus: post.linkedinApprovalStatus ?? "none",
    linkedinStatus: post.linkedinStatus ?? "idle",
    linkedinPostedAt: post.linkedinPostedAt ? new Date(post.linkedinPostedAt) : null,
    linkedinPostUrl: post.linkedinPostUrl ?? null,
    linkedinAdminNote: post.linkedinAdminNote ?? null,
  };
  await db.blogPost.upsert({
    where: { slug: post.slug },
    create: { slug: post.slug, body: "", ...data },
    update: { ...data, imageUrl: data.imageUrl }, // explicit to satisfy TS
  });
  await putBlogBody(post.slug, post.body);
  return post.slug;
}

export async function deleteBlog(slug: string): Promise<void> {
  await Promise.all([
    db.blogPost.deleteMany({ where: { slug } }),
    deleteBlogBody(slug),
  ]);
}
