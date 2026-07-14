"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Resource = { id: string; type: string; tag?: string; title: string; description?: string; url?: string; blobSlug?: string; published: boolean; createdAt: string };

const TYPE_ICON: Record<string, string> = { blog: "✍️", video: "🎬", live_recording: "📹", image: "🖼️", link: "🔗", document: "📄" };
const TAG_COLOR: Record<string, string> = { live_class: "#f59e0b", recorded: "#34d399", supplementary: "#5b7cfa" };

const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };

const TYPES = ["video", "live_recording", "image", "link", "document"];
const TAGS = ["", "live_class", "recorded", "supplementary"];

export default function TeacherResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ type: "video", tag: "", title: "", description: "", url: "", published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/teacher/resources").then(r => r.json()).then(d => { setResources(Array.isArray(d) ? d : []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/teacher/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tag: form.tag || null }) });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — the resource wasn't saved.");
      return;
    }
    setOpen(false);
    setForm({ type: "video", tag: "", title: "", description: "", url: "", published: false });
    load();
  }

  async function togglePublish(r: Resource) {
    await fetch(`/api/teacher/resources/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !r.published }) });
    load();
  }

  async function deleteResource(id: string) {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/teacher/resources/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter === "all" ? resources : resources.filter(r => r.type === filter);
  const types = ["all", ...Array.from(new Set(resources.map(r => r.type)))];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Resource Library</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{resources.length} resources · Videos, Live Recordings, Images, Links, Documents</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/teacher/blogs/new" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", textDecoration: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13 }}>
            ✍️ New Blog
          </Link>
          <button onClick={() => { setError(""); setOpen(true); }} style={{ background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + Add Resource
          </button>
        </div>
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid", fontFamily: "inherit", borderColor: filter === t ? "var(--primary)" : "var(--border)", background: filter === t ? "rgba(91,124,250,0.1)" : "var(--surface-2)", color: filter === t ? "var(--primary)" : "var(--text-muted)" }}>
            {t === "all" ? "All" : `${TYPE_ICON[t] ?? "📎"} ${t.replace("_", " ")}`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No resources yet. Add videos, recordings, images or links to use in your courses.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICON[r.type] ?? "📎"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {r.type.replace("_", " ")}
                  {r.tag && <span style={{ marginLeft: 8, padding: "1px 8px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${TAG_COLOR[r.tag]}20`, color: TAG_COLOR[r.tag], border: `1px solid ${TAG_COLOR[r.tag]}40` }}>{r.tag.replace("_", " ")}</span>}
                  {r.url && <span style={{ marginLeft: 8 }}>· <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>Open ↗</a></span>}
                </div>
              </div>
              <button onClick={() => togglePublish(r)} style={{ fontSize: 11, padding: "3px 12px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, background: r.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: r.published ? "#34d399" : "var(--text-muted)", border: `1px solid ${r.published ? "rgba(52,211,153,0.25)" : "var(--border)"}`, flexShrink: 0 }}>
                {r.published ? "Published" : "Draft"}
              </button>
              <button onClick={() => deleteResource(r.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Add Resource</h2>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {t.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tag</label>
                  <select value={form.tag} onChange={e => set("tag", e.target.value)} style={inputStyle}>
                    {TAGS.map(t => <option key={t} value={t}>{t ? t.replace("_", " ") : "None"}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Title *</label>
                <input required value={form.title} onChange={e => set("title", e.target.value)} style={inputStyle} placeholder="e.g. Introduction to Arrays – Live Class" />
              </div>
              <div>
                <label style={labelStyle}>{form.type === "live_recording" ? "YouTube / Zoom URL" : form.type === "video" ? "YouTube / Vimeo URL" : "URL"}</label>
                <input type="url" value={form.url} onChange={e => set("url", e.target.value)} style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
                {(form.type === "live_recording" || form.type === "video") && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Tip: Upload Zoom recordings to YouTube as Unlisted for permanent free hosting.</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
                Publish immediately
              </label>
              {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 2, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
                  {saving ? "Saving…" : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
