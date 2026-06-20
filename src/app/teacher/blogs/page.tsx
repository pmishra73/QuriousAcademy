"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Post = { id: string; title: string; category: string; author: string; published: boolean; createdAt: string };

export default function TeacherBlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/blogs").then(r => r.json()).then(d => { setPosts(d); setLoading(false); });
  }, []);

  async function togglePublished(post: Post) {
    const updated = { ...post, published: !post.published };
    setPosts(ps => ps.map(p => p.id === post.id ? updated : p));
    await fetch(`/api/teacher/blogs/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: updated.published }),
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>My Blog Posts</h1>
        <Link href="/teacher/blogs/new" style={{ background: "var(--primary)", color: "white", textDecoration: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          + New Post
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
      ) : posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You haven&apos;t written any posts yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {p.category} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
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
              <Link href={`/teacher/blogs/${p.id}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", flexShrink: 0 }}>Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
