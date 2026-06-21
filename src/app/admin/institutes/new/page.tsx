"use client";
import { useState } from "react";
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

export default function NewInstitutePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", bio: "", logo: "", website: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/institutes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/admin/institutes");
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/institutes" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Institutes</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Add Institute</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={lbl}>Institute Name *</label>
          <input
            style={inp}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }))}
            placeholder="e.g. Besant Technologies"
            required
          />
        </div>
        <div>
          <label style={lbl}>Subdomain Slug *</label>
          <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-muted)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>slug.</span>
            <input style={{ ...inp, border: "none", borderRadius: 0, flex: 1 }} value={form.slug} onChange={set("slug")} placeholder="besanttech" required />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
            Creates a page at <strong>{form.slug || "slug"}.quriousacademy.com</strong>
          </p>
        </div>
        <div>
          <label style={lbl}>Logo URL <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
          <input style={inp} value={form.logo} onChange={set("logo")} placeholder="https://..." />
        </div>
        <div>
          <label style={lbl}>Website <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
          <input style={inp} value={form.website} onChange={set("website")} placeholder="https://besanttechnologies.com" />
        </div>
        <div>
          <label style={lbl}>Bio / Description <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.bio} onChange={set("bio")} placeholder="Short description shown on the institute page" />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Creating…" : "Create Institute"}
          </button>
          <Link href="/admin/institutes" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
