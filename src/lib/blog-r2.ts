import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { SdkStream } from "@aws-sdk/types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStream = SdkStream<any>;

function r2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const BUCKET = process.env.R2_BUCKET_NAME ?? "qurious-blogs";
const key = (slug: string) => `blogs/${slug}.md`;

export async function putBlogBody(slug: string, body: string): Promise<void> {
  await r2().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key(slug),
    Body: body,
    ContentType: "text/markdown; charset=utf-8",
  }));
}

export async function getBlogBody(slug: string): Promise<string | null> {
  try {
    const res = await r2().send(new GetObjectCommand({ Bucket: BUCKET, Key: key(slug) }));
    return (await res.Body?.transformToString()) ?? null;
  } catch {
    return null;
  }
}

export async function deleteBlogBody(slug: string): Promise<void> {
  try {
    await r2().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key(slug) }));
  } catch {
    // not found — nothing to do
  }
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function putBlogImage(imageKey: string, body: Buffer, contentType: string): Promise<void> {
  await r2().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: imageKey,
    Body: body,
    ContentType: contentType,
  }));
}

export async function getBlogImage(imageKey: string): Promise<{ stream: AnyStream; contentType: string } | null> {
  try {
    const res = await r2().send(new GetObjectCommand({ Bucket: BUCKET, Key: imageKey }));
    if (!res.Body) return null;
    return { stream: res.Body as AnyStream, contentType: res.ContentType ?? "image/jpeg" };
  } catch {
    return null;
  }
}

export async function deleteBlogImage(imageKey: string): Promise<void> {
  try {
    await r2().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: imageKey }));
  } catch {
    // not found — nothing to do
  }
}
