"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

type Institute = { id: string; name: string };

export default function NewTeacherPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "", slug: "", instituteId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  useEffect(() => {
    fetch("/api/admin/institutes").then((r) => r.json()).then(setInstitutes).catch(() => {});
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, instituteId: form.instituteId || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/admin/teachers");
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/teachers" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Teachers</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Add Teacher</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={lbl}>Full Name *</label>
          <input
            style={inp}
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }));
            }}
            placeholder="e.g. Ananya Sharma"
            required
          />
        </div>
        <div>
          <label style={lbl}>Email Address *</label>
          <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="ananya@example.com" required />
        </div>
        <div>
          <label style={lbl}>Temporary Password *</label>
          <PasswordInput style={inp} value={form.password} onChange={set("password")} placeholder="They can change this after login" required />
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
            Share this with the teacher so they can log in and update it from their profile.
          </p>
        </div>
        <div>
          <label style={lbl}>Subdomain Slug <span style={{ fontWeight: 400, textTransform: "none" }}>— their page URL</span></label>
          <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-muted)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>slug.</span>
            <input style={{ ...inp, border: "none", borderRadius: 0, flex: 1 }} value={form.slug} onChange={set("slug")} placeholder="ananyasharma" />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
            Lowercase letters and numbers only. Creates a page at <strong>{form.slug || "slug"}.quriousacademy.com</strong>
          </p>
        </div>
        <div>
          <label style={lbl}>Institute <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
          <select style={inp} value={form.instituteId} onChange={set("instituteId")}>
            <option value="">Independent teacher</option>
            {institutes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Bio <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.bio} onChange={set("bio")} placeholder="Short bio shown on public pages" />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Creating…" : "Create Teacher Account"}
          </button>
          <Link href="/admin/teachers" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
