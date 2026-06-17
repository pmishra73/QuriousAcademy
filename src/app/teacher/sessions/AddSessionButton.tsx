"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSessionButton({ courseIds }: { courseIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ courseId: courseIds[0] ?? "", title: "", scheduledAt: "", meetingLink: "", notes: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/teacher/sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        + Add Session
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: 460 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Add Session</h2>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Course</label>
                <select value={form.courseId} onChange={(e) => set("courseId", e.target.value)} style={{ ...inputStyle }}>
                  {courseIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Session title</label>
                <input required value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="e.g. Introduction to Python" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Date & time</label>
                <input required type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Meeting link (optional)</label>
                <input type="url" value={form.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} style={inputStyle} placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Notes / agenda (optional)</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                  {loading ? "Saving…" : "Add Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
