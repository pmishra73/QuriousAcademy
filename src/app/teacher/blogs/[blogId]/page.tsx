"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

const CATEGORIES = ["General", "Programming", "Mathematics", "AI & ML", "Science", "Technology", "Data Structures", "Interview Prep", "Career"];

type Form = { slug: string; title: string; excerpt: string; body: string; category: string; videoUrl: string; published: boolean };

export default function TeacherEditBlogPage({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = use(params);
  const isNew = blogId === "new";
  const router = useRouter();
  const [form, setForm] = useState<Form>({ slug: "", title: "", excerpt: "", body: "", category: "General", videoUrl: "", published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/teacher/blogs-blob/${blogId}`).then(r => r.json()).then((p: Form) => {
        setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", body: p.body, category: p.category, videoUrl: p.videoUrl ?? "", published: p.published });
      });
    }
  }, [blogId, isNew]);

  // Auto-generate slug from title
  function handleTitle(v: string) {
    const slug = isNew ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug;
    setForm(f => ({ ...f, title: v, slug: isNew ? slug : f.slug }));
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function loadPreview() {
    setPreviewLoading(true);
    const res = await fetch("/api/teacher/blogs-blob/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: form.body }),
    });
    const { html } = await res.json();
    setPreviewHtml(html);
    setPreviewLoading(false);
    setPreview(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true); setError("");
    const payload = { ...form, videoUrl: form.videoUrl.trim() || undefined };
    const res = isNew
      ? await fetch("/api/teacher/blogs-blob", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/teacher/blogs-blob/${blogId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/teacher/blogs");
  }

  return (
    <div style={{ maxWidth: preview ? "100%" : 760 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/teacher/blogs" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Blogs</Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        <button type="button" onClick={preview ? () => setPreview(false) : loadPreview}
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>
          {preview ? "← Back to Editor" : (previewLoading ? "Loading…" : "Preview ↗")}
        </button>
      </div>

      {preview ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Editor</div>
            <textarea
              value={form.body}
              onChange={set("body")}
              style={{ ...inp, minHeight: "70vh", resize: "vertical", lineHeight: 1.7, fontFamily: "monospace", fontSize: 13 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Preview</div>
            <div className="prose" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 28px", minHeight: "70vh", overflowY: "auto" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} value={form.title} onChange={e => handleTitle(e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>Slug *</label>
              <input style={inp} value={form.slug} onChange={set("slug")} placeholder="url-friendly-slug" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Category</label>
              <select style={inp} value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                Publish immediately
              </label>
            </div>
          </div>

          <div>
            <label style={lbl}>Excerpt</label>
            <input style={inp} value={form.excerpt} onChange={set("excerpt")} placeholder="Short description shown in blog listings" />
          </div>

          <div>
            <label style={lbl}>Video URL (optional — YouTube or Vimeo)</label>
            <input style={inp} type="url" value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Embedded above the article body on the public page.</div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={lbl}>Body * (Markdown)</label>
              <button type="button" onClick={loadPreview} style={{ fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {previewLoading ? "Loading…" : "Preview →"}
              </button>
            </div>
            <textarea style={{ ...inp, minHeight: 340, resize: "vertical", lineHeight: 1.7, fontFamily: "monospace", fontSize: 13 }} value={form.body} onChange={set("body")} required
              placeholder={"# Section heading\n\nYour content here. Supports **bold**, *italic*, `code`, lists, and more.\n\n## Another section\n\nKeep writing..."} />
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Saving…" : isNew ? "Publish Post" : "Save Changes"}
            </button>
            <Link href="/teacher/blogs" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
