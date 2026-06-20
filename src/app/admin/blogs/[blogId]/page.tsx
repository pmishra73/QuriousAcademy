"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

type Post = { id: string; slug: string; title: string; excerpt: string; body: string; category: string; author: string; published: boolean };

export default function AdminEditBlogPage({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = use(params);
  const isNew = blogId === "new";
  const router = useRouter();
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", body: "", category: "General", published: false });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/blogs/${blogId}`).then(r => r.json()).then((p: Post) => {
        setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, category: p.category, published: p.published });
      });
    }
  }, [blogId, isNew]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true); setError("");
    const res = isNew
      ? await fetch("/api/admin/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch(`/api/admin/blogs/${blogId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/admin/blogs");
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/blogs/${blogId}`, { method: "DELETE" });
    router.push("/admin/blogs");
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/blogs" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Blogs</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{isNew ? "New Post" : "Edit Post"}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={lbl}>Title *</label>
            <input style={inp} value={form.title} onChange={set("title")} required />
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
              {["General", "Data Science", "Finance", "Career", "Technology", "Interview Prep"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
              Published
            </label>
          </div>
        </div>
        <div>
          <label style={lbl}>Excerpt</label>
          <input style={inp} value={form.excerpt} onChange={set("excerpt")} placeholder="Short description shown in listings" />
        </div>
        <div>
          <label style={lbl}>Body *</label>
          <textarea style={{ ...inp, minHeight: 300, resize: "vertical", lineHeight: 1.6 }} value={form.body} onChange={set("body")} required />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : isNew ? "Publish Post" : "Save Changes"}
          </button>
          <Link href="/admin/blogs" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
            Cancel
          </Link>
          {!isNew && (
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginLeft: "auto", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              {deleting ? "Deleting…" : "Delete Post"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
