"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SessionData = {
  id: string;
  title: string;
  courseId: string;
  scheduledAt: string;
  meetingLink: string | null;
  notes: string | null;
  status: string;
};

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

export default function SessionActions({ session }: { session: SessionData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: session.title,
    scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
    meetingLink: session.meetingLink ?? "",
    notes: session.notes ?? "",
    status: session.status,
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/teacher/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    });
    setSaving(false);
    setEditOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/teacher/sessions/${session.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setEditOpen(true)}
          style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", background: "none", border: "none", color: "#ef4444" }}
        >
          Delete
        </button>
      </div>

      {editOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: "min(520px,100%)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Edit Session</h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Title *</label>
                <input required style={inp} value={form.title} onChange={set("title")} />
              </div>
              <div>
                <label style={lbl}>Date &amp; Time *</label>
                <input required type="datetime-local" style={inp} value={form.scheduledAt} onChange={set("scheduledAt")} />
              </div>
              <div>
                <label style={lbl}>Meeting Link</label>
                <input type="url" style={inp} value={form.meetingLink} onChange={set("meetingLink")} placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label style={lbl}>Notes</label>
                <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={form.notes} onChange={set("notes")} />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={form.status} onChange={set("status")}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 2, background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
