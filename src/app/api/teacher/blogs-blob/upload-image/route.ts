import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { putBlogImage } from "@/lib/blog-r2";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are allowed" }, { status: 415 });

  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 413 });

  const slug = (form.get("slug") as string | null)?.trim() || "blog";
  const ts = Date.now();
  const imageKey = `blogs/images/${slug}-${ts}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await putBlogImage(imageKey, buffer, file.type);

  return NextResponse.json({ url: `/api/blog/image/${imageKey}` });
}
