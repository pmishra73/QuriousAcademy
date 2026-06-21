"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Post = { slug: string; title: string; category: string; author: string; videoUrl?: string; published: boolean; createdAt: string };

export default function TeacherBlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/teacher/blogs-blob").then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function togglePublished(post: Post) {
    setPosts(ps => ps.map(p => p.slug === post.slug ? { ...p, published: !p.published } : p));
    await fetch(`/api/teacher/blogs-blob/${post.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
  }

  async function deletePost(slug: string) {
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/teacher/blogs-blob/${slug}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>My Blog Posts</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Stored on CDN · published instantly, no deploy needed</p>
        </div>
        <Link href="/teacher/blogs/new" style={{ background: "var(--primary)", color: "white", textDecoration: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          + New Post
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
      ) : posts.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No posts yet. Click "+ New Post" to write your first article.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map(p => (
            <div key={p.slug} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.title}
                  {p.videoUrl && <span style={{ marginLeft: 8, fontSize: 11, color: "#34d399" }}>▶ Video</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {p.category} · {new Date(p.createdAt).toLocaleDateString("en-IN")}
                </div>
              </div>
              <button onClick={() => togglePublished(p)} style={{ fontSize: 11, padding: "3px 12px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, background: p.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: p.published ? "#34d399" : "var(--text-muted)", border: `1px solid ${p.published ? "rgba(52,211,153,0.25)" : "var(--border)"}` }}>
                {p.published ? "Published" : "Draft"}
              </button>
              <Link href={`/teacher/blogs/${p.slug}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", flexShrink: 0 }}>Edit</Link>
              <button onClick={() => deletePost(p.slug)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
