import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
