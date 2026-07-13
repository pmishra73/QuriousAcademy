"use client";
import { useState, useEffect, useRef } from "react";
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

type Institute = { id: string; slug: string; name: string; bio: string | null; logo: string | null; website: string | null; active: boolean; teachers: { id: string; name: string; slug: string | null }[] };
type Teacher = { id: string; name: string; email: string; slug: string | null; instituteId: string | null };

export default function InstituteEditClient({ institute }: { institute: Institute }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: institute.name,
    slug: institute.slug,
    bio: institute.bio ?? "",
    logo: institute.logo ?? "",
    website: institute.website ?? "",
    active: institute.active,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [teacherSaving, setTeacherSaving] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Teacher[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/admin/teachers?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/institutes/${institute.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Update failed"); return; }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${institute.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/institutes/${institute.id}`, { method: "DELETE" });
    router.push("/admin/institutes");
  }

  async function toggleTeacher(teacherId: string, isLinked: boolean) {
    setTeacherSaving(teacherId);
    await fetch(`/api/admin/teachers/${teacherId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instituteId: isLinked ? null : institute.id }),
    });
    setTeacherSaving(null);
    if (!isLinked) { setQuery(""); setResults([]); }
    router.refresh();
  }

  const linkedIds = new Set(institute.teachers.map((t) => t.id));

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/institutes" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Institutes</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{institute.name}</h1>
      </div>

      <form onSubmit={handleSave} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
        <div>
          <label style={lbl}>Institute Name *</label>
          <input style={inp} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label style={lbl}>Subdomain Slug *</label>
          <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-muted)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>slug.</span>
            <input style={{ ...inp, border: "none", borderRadius: 0, flex: 1 }} value={form.slug} onChange={set("slug")} required />
          </div>
        </div>
        <div>
          <label style={lbl}>Logo URL</label>
          <input style={inp} value={form.logo} onChange={set("logo")} placeholder="https://..." />
        </div>
        <div>
          <label style={lbl}>Website</label>
          <input style={inp} value={form.website} onChange={set("website")} placeholder="https://..." />
        </div>
        <div>
          <label style={lbl}>Bio / Description</label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.bio} onChange={set("bio")} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          <label htmlFor="active" style={{ fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>Active (visible on public pages)</label>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {deleting ? "Deleting…" : "Delete Institute"}
          </button>
        </div>
      </form>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Teachers</h2>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Teachers linked to this institute. Teachers without their own slug won't have individual pages, but their courses will appear on the institute page.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {institute.teachers.map((t) => {
            const busy = teacherSaving === t.id;
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(91,124,250,0.06)", border: "1px solid rgba(91,124,250,0.25)", borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                <button
                  onClick={() => toggleTeacher(t.id, true)}
                  disabled={busy}
                  style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                >
                  {busy ? "…" : "Remove"}
                </button>
              </div>
            );
          })}
          {institute.teachers.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No teachers linked yet — search below to add one.</p>}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Add a teacher — search by name or slug
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Ananya, or her page slug"
            style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {query.trim() && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {searching && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Searching…</p>}
              {!searching && results.length === 0 && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No matching teachers.</p>}
              {results.map((t) => {
                const linked = linkedIds.has(t.id);
                const busy = teacherSaving === t.id;
                const elsewhere = !!t.instituteId && t.instituteId !== institute.id;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.email}{t.slug ? ` · ${t.slug}` : ""}</div>
                    </div>
                    {elsewhere && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>other institute</span>}
                    <button
                      onClick={() => toggleTeacher(t.id, linked)}
                      disabled={busy || linked || elsewhere}
                      style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: "1px solid var(--border)", background: linked ? "var(--surface)" : "var(--primary)", color: linked ? "var(--text-muted)" : "white", cursor: linked || elsewhere ? "default" : "pointer", fontFamily: "inherit", fontWeight: 600 }}
                    >
                      {busy ? "…" : linked ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
