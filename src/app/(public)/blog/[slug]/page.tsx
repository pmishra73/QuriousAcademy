import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/blog-blob";
import { db } from "@/lib/db";
import SuggestEditButton from "@/components/SuggestEditButton";

export const dynamic = "force-dynamic";

const catText: Record<string, string> = {
  Programming: "#7c9dfc", Mathematics: "#a78bfa", "AI & ML": "#34d399",
  Science: "#fbbf24", Technology: "#fb923c",
};
const catBg: Record<string, string> = {
  Programming: "rgba(91,124,250,0.1)", Mathematics: "rgba(139,111,247,0.1)",
  "AI & ML": "rgba(52,211,153,0.1)", Science: "rgba(251,191,36,0.1)", Technology: "rgba(249,115,22,0.1)",
};

function embedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${u.pathname.split("/").pop()}`;
    }
  } catch { /* ignore */ }
  return null;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await getBlog(slug);
  if (!post || !post.published) notFound();

  const color = catText[post.category] ?? "var(--primary)";
  const bg = catBg[post.category] ?? "rgba(91,124,250,0.1)";

  const prasant = await db.user.findFirst({ where: { role: "admin" }, select: { id: true } });
  const ownerId = post.authorId || prasant?.id || "";
  const embed = post.videoUrl ? embedUrl(post.videoUrl) : null;

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/blog" style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
            ← Back to Resources
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 100, background: bg, color, fontWeight: 600 }}>{post.category}</span>
            {post.videoUrl && <span style={{ fontSize: 12, color: "#34d399" }}>▶ Includes video</span>}
          </div>
          <h1 style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.25, marginBottom: 20 }}>{post.title}</h1>
          <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>{post.excerpt}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--primary),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {post.author[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>by {post.author}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {new Date(post.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded video */}
      {embed && (
        <section style={{ padding: "40px 24px 0" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#0a0e1a" }}>
              <iframe
                src={embed}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </section>
      )}

      {/* Article body */}
      <section style={{ padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }} className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </section>

      {/* Suggest edit */}
      <section style={{ padding: "0 24px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "flex-end" }}>
          <SuggestEditButton contentType="blog" contentId={slug} contentTitle={post.title} ownerId={ownerId} />
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: "64px 24px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>Want to go deeper?</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", marginBottom: 12 }}>Learn this live, with Prasant</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
            Articles give you a foundation. Live classes give you mastery — where you can ask questions, get real feedback, and build projects.
          </p>
          <Link href="/courses" style={{ background: "var(--primary)", color: "white", padding: "13px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15, display: "inline-block" }}>
            Browse Courses →
          </Link>
        </div>
      </section>
    </div>
  );
}
