"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = { id: string; title: string; category: string; author: string; published: boolean; createdAt: string };
type Video = { id: string; title: string; courseId: string; published: boolean; createdAt: string; teacher: { name: string } };

export default function AdminContentPage() {
  const [tab, setTab] = useState<"blogs" | "videos">("blogs");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  async function loadBlogs() {
    const res = await fetch("/api/admin/blogs");
    setBlogs(await res.json());
  }
  async function loadVideos() {
    const res = await fetch("/api/teacher/videos");
    setVideos(await res.json());
  }

  useEffect(() => { loadBlogs(); loadVideos(); }, []);

  async function toggleBlog(id: string, published: boolean) {
    await fetch(`/api/admin/blogs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    loadBlogs();
  }
  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    loadBlogs();
  }
  async function toggleVideo(id: string, published: boolean) {
    await fetch(`/api/teacher/videos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    loadVideos();
  }
  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/teacher/videos/${id}`, { method: "DELETE" });
    loadVideos();
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? "var(--primary)" : "var(--text-muted)",
    background: active ? "rgba(91,124,250,0.1)" : "transparent",
    border: active ? "1px solid rgba(91,124,250,0.25)" : "1px solid transparent",
    cursor: "pointer", fontFamily: "inherit",
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Content</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>All teacher-created blogs and videos</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={tabStyle(tab === "blogs")} onClick={() => setTab("blogs")}>Blogs ({blogs.length})</button>
        <button style={tabStyle(tab === "videos")} onClick={() => setTab("videos")}>Videos ({videos.length})</button>
      </div>

      {tab === "blogs" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {blogs.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No blog posts yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Title", "Category", "Author", "Status", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{b.title}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{b.category}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{b.author}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => toggleBlog(b.id, b.published)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1px solid ${b.published ? "rgba(52,211,153,0.3)" : "var(--border)"}`, background: b.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: b.published ? "#34d399" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                        {b.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <Link href={`/admin/blogs/${b.id}`} style={{ fontSize: 12, color: "var(--primary)" }}>Edit</Link>
                        <button onClick={() => deleteBlog(b.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "videos" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {videos.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No videos yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Title", "Course", "Teacher", "Status", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{v.title}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{v.courseId}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{v.teacher?.name}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => toggleVideo(v.id, v.published)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1px solid ${v.published ? "rgba(52,211,153,0.3)" : "var(--border)"}`, background: v.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: v.published ? "#34d399" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                        {v.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{new Date(v.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => deleteVideo(v.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
