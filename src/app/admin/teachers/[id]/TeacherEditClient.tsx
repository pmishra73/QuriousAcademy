"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

type Teacher = {
  id: string; name: string; email: string; bio: string | null; photo: string | null;
  slug: string | null; active: boolean; instituteId: string | null;
};
type Institute = { id: string; name: string };
type CourseOption = { id: string; title: string };

function CourseAssignments({ teacherId, allCourses }: { teacherId: string; allCourses: CourseOption[] }) {
  const [assigned, setAssigned] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/teachers/${teacherId}/assignments`).then(r => r.json()).then(setAssigned);
  }, [teacherId]);

  async function toggle(courseId: string) {
    setSaving(courseId);
    const isAssigned = assigned.includes(courseId);
    await fetch(`/api/admin/teachers/${teacherId}/assignments`, {
      method: isAssigned ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setAssigned(prev => isAssigned ? prev.filter(id => id !== courseId) : [...prev, courseId]);
    setSaving(null);
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, marginTop: 24 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Course Assignments</h2>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
        Teachers can only build content and create sessions for courses they are assigned to.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {allCourses.map(c => {
          const isAssigned = assigned.includes(c.id);
          return (
            <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: isAssigned ? "rgba(52,211,153,0.06)" : "transparent", border: `1px solid ${isAssigned ? "rgba(52,211,153,0.2)" : "var(--border)"}` }}>
              <input
                type="checkbox"
                checked={isAssigned}
                disabled={saving === c.id}
                onChange={() => toggle(c.id)}
                style={{ width: 15, height: 15, accentColor: "#34d399", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{c.id}</div>
              </div>
              {saving === c.id && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Saving…</span>}
              {isAssigned && saving !== c.id && <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>✓ Assigned</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherEditClient({ teacher, institutes, allCourses }: { teacher: Teacher; institutes: Institute[]; allCourses: CourseOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: teacher.name,
    bio: teacher.bio ?? "",
    photo: teacher.photo ?? "",
    slug: teacher.slug ?? "",
    active: teacher.active,
    instituteId: teacher.instituteId ?? "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/admin/teachers/${teacher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, instituteId: form.instituteId || null, ...(newPassword.trim() && { password: newPassword.trim() }) }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Update failed"); return; }
    setNewPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/teachers" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Teachers</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{teacher.name}</h1>
      </div>

      <form onSubmit={handleSave} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={lbl}>Full Name *</label>
          <input style={inp} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label style={lbl}>Email</label>
          <input style={{ ...inp, opacity: 0.6 }} value={teacher.email} disabled />
        </div>
        <div>
          <label style={lbl}>Photo URL</label>
          <input style={inp} value={form.photo} onChange={set("photo")} placeholder="https://..." />
        </div>
        <div>
          <label style={lbl}>Subdomain Slug <span style={{ fontWeight: 400, textTransform: "none" }}>— their page URL</span></label>
          <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-muted)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>slug.</span>
            <input style={{ ...inp, border: "none", borderRadius: 0, flex: 1 }} value={form.slug} onChange={set("slug")} placeholder="ananyasharma" />
          </div>
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
        <div>
          <label style={lbl}>Reset Password <span style={{ fontWeight: 400, textTransform: "none" }}>optional — leave blank to keep current password</span></label>
          <PasswordInput style={inp} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          <label htmlFor="active" style={{ fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>Active (can log in, visible on public pages)</label>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={saving} style={{ background: saved ? "#34d399" : "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </form>

      <CourseAssignments teacherId={teacher.id} allCourses={allCourses} />
    </div>
  );
}
