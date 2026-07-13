"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  slug: string; title: string; category: string; author: string; published: boolean; createdAt: string;
  linkedinRequested?: boolean; linkedinApprovalStatus?: "none" | "pending" | "approved" | "rejected";
};

const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 500, background: bg, color,
});

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/blogs-blob").then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function togglePublished(post: Post) {
    const updated = { ...post, published: !post.published };
    setPosts(ps => ps.map(p => p.slug === post.slug ? updated : p));
    await fetch(`/api/teacher/blogs-blob/${post.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: updated.published }),
    });
  }

  async function setLinkedInStatus(post: Post, status: "approved" | "rejected") {
    setPosts(ps => ps.map(p => p.slug === post.slug ? { ...p, linkedinApprovalStatus: status } : p));
    await fetch(`/api/teacher/blogs-blob/${post.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedinApprovalStatus: status }),
    });
  }

  async function deletePost(slug: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/teacher/blogs-blob/${slug}`, { method: "DELETE" });
    setPosts(ps => ps.filter(p => p.slug !== slug));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Blog Posts</h1>
        <Link href="/admin/blogs/new" style={{ background: "var(--primary)", color: "white", textDecoration: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          + New Post
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
      ) : posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No posts yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map(p => (
            <div key={p.slug} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {p.category} · {p.author} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>

              {p.linkedinApprovalStatus === "pending" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={badgeStyle("rgba(10,102,194,0.1)", "#5b9bd5")}>LinkedIn: pending</span>
                  <button onClick={() => setLinkedInStatus(p, "approved")} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.1)", color: "#34d399", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Approve</button>
                  <button onClick={() => setLinkedInStatus(p, "rejected")} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Reject</button>
                </div>
              )}
              {p.linkedinApprovalStatus === "approved" && <span style={badgeStyle("rgba(52,211,153,0.1)", "#34d399")}>LinkedIn: approved</span>}
              {p.linkedinApprovalStatus === "rejected" && <span style={badgeStyle("rgba(239,68,68,0.1)", "#ef4444")}>LinkedIn: rejected</span>}

              <button
                onClick={() => togglePublished(p)}
                style={{
                  fontSize: 11, padding: "3px 12px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                  background: p.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)",
                  color: p.published ? "#34d399" : "var(--text-muted)",
                  border: `1px solid ${p.published ? "rgba(52,211,153,0.25)" : "var(--border)"}`,
                }}>
                {p.published ? "Published" : "Draft"}
              </button>
              <Link href={`/admin/blogs/${p.slug}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", flexShrink: 0 }}>Edit</Link>
              <button onClick={() => deletePost(p.slug)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
