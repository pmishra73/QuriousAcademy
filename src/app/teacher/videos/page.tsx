"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Video = { id: string; courseId: string; title: string; url: string; description: string | null; published: boolean; createdAt: string };

function embedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").pop();
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* ignore */ }
  return null;
}

export default function TeacherVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ courseId: "", title: "", url: "", description: "", published: false });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Video | null>(null);

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function load() {
    const res = await fetch("/api/teacher/videos");
    setVideos(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/teacher/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setOpen(false);
    setForm({ courseId: "", title: "", url: "", description: "", published: false });
    load();
  }

  async function togglePublish(v: Video) {
    await fetch(`/api/teacher/videos/${v.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !v.published }) });
    load();
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/teacher/videos/${id}`, { method: "DELETE" });
    load();
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Videos</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{videos.length} video{videos.length !== 1 ? "s" : ""} across your courses</p>
        </div>
        <button onClick={() => setOpen(true)} style={{ background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          + Add Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No videos yet. Add your first video above.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {videos.map((v) => {
            const embed = embedUrl(v.url);
            return (
              <div key={v.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ position: "relative", paddingTop: "56.25%", background: "#0a0e1a", cursor: "pointer" }} onClick={() => setPreview(v)}>
                  {embed ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "rgba(255,255,255,0.3)" }}>▶</div>
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>No preview</div>
                  )}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>{v.courseId}</div>
                  {v.description && <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 10 }}>{v.description}</p>}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => togglePublish(v)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1px solid ${v.published ? "rgba(52,211,153,0.3)" : "var(--border)"}`, background: v.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: v.published ? "#34d399" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                      {v.published ? "Published" : "Draft"}
                    </button>
                    <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--primary)" }}>Open ↗</a>
                    <button onClick={() => deleteVideo(v.id)} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginLeft: "auto", fontFamily: "inherit" }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Video Modal */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Add Video</h2>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Course ID</label>
                <input required value={form.courseId} onChange={(e) => set("courseId", e.target.value)} style={inputStyle} placeholder="e.g. dsa-sprint" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Title</label>
                <input required value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="e.g. Intro to Arrays" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>YouTube / Vimeo URL</label>
                <input required type="url" value={form.url} onChange={(e) => set("url", e.target.value)} style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Description (optional)</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
                Publish immediately
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
                  {saving ? "Saving…" : "Add Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={() => setPreview(null)}>
          <div style={{ width: "min(720px, 95vw)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe src={embedUrl(preview.url) ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: 12 }} allowFullScreen />
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => setPreview(null)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
