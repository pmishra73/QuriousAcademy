import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllBlogsMeta, getBlogRaw, saveBlog } from "@/lib/blog-blob";
import { postToLinkedIn, buildPostText } from "@/lib/linkedin";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await db.linkedInIntegration.findUnique({ where: { id: "singleton" } });
  if (!integration?.accessToken || !integration.organizationUrn) {
    return NextResponse.json({ skipped: "LinkedIn not connected" });
  }

  if (integration.lastPostedAt) {
    const gapMs = integration.minGapMinutes * 60 * 1000;
    const elapsed = Date.now() - integration.lastPostedAt.getTime();
    if (elapsed < gapMs) {
      return NextResponse.json({ skipped: "Within minimum gap window", retryInMs: gapMs - elapsed });
    }
  }

  const all = await getAllBlogsMeta();
  const eligible = all
    .filter((p) => p.linkedinApprovalStatus === "approved" && p.linkedinStatus !== "posted")
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  if (eligible.length === 0) {
    return NextResponse.json({ skipped: "No approved posts pending" });
  }

  const next = eligible[0];
  const full = await getBlogRaw(next.slug);
  if (!full) return NextResponse.json({ error: "Post disappeared before publish" }, { status: 404 });

  try {
    const postUrl = await postToLinkedIn(buildPostText(full.title, full.excerpt, full.slug));
    await saveBlog({ ...full, linkedinStatus: "posted", linkedinPostedAt: new Date().toISOString(), linkedinPostUrl: postUrl, updatedAt: new Date().toISOString() });
    await db.linkedInIntegration.update({ where: { id: "singleton" }, data: { lastPostedAt: new Date() } });
    return NextResponse.json({ ok: true, slug: full.slug, postUrl });
  } catch (err) {
    await saveBlog({ ...full, linkedinStatus: "failed", updatedAt: new Date().toISOString() });
    console.error("LinkedIn auto-publish failed:", err);
    return NextResponse.json({ error: "Publish failed", slug: full.slug }, { status: 502 });
  }
}
