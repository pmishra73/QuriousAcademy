import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogRaw, saveBlog } from "@/lib/blog-blob";
import { postToLinkedIn, buildPostText } from "@/lib/linkedin";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const post = await getBlogRaw(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.linkedinApprovalStatus !== "approved") {
    return NextResponse.json({ error: "This post hasn't been approved for LinkedIn yet." }, { status: 400 });
  }
  if (post.linkedinStatus === "posted") {
    return NextResponse.json({ error: "This post has already been posted to LinkedIn." }, { status: 400 });
  }

  try {
    const postUrl = await postToLinkedIn(buildPostText(post.title, post.excerpt, post.slug));
    await saveBlog({ ...post, linkedinStatus: "posted", linkedinPostedAt: new Date().toISOString(), linkedinPostUrl: postUrl, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, postUrl });
  } catch (err) {
    await saveBlog({ ...post, linkedinStatus: "failed", updatedAt: new Date().toISOString() });
    console.error("Manual LinkedIn publish failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Publish failed" }, { status: 502 });
  }
}
