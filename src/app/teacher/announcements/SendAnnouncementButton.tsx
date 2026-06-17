"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendAnnouncementButton({ courseIds }: { courseIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [form, setForm] = useState({ courseId: courseIds[0] ?? "", subject: "", body: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/teacher/announcements/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    setSent(data.sent ?? 0);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        + Send Announcement
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Send Announcement</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 22 }}>Email will be sent to all confirmed students in the selected course.</p>

            {sent !== null ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Sent to {sent} student{sent !== 1 ? "s" : ""}</div>
                <button onClick={() => { setOpen(false); setSent(null); setForm({ ...form, subject: "", body: "" }); }}
                  style={{ marginTop: 16, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 24px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Course</label>
                  <select value={form.courseId} onChange={(e) => set("courseId", e.target.value)} style={inputStyle}>
                    {courseIds.map((id) => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Subject</label>
                  <input required value={form.subject} onChange={(e) => set("subject", e.target.value)} style={inputStyle} placeholder="e.g. Session reschedule notice" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Message</label>
                  <textarea required value={form.body} onChange={(e) => set("body", e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Write your message here…" />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                    {loading ? "Sending…" : "Send to all students"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
