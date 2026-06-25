"use client";
import { useState } from "react";

export default function NotifyMeButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    await fetch(`/api/courses/${courseId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setState("done");
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "var(--foreground)",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(251,191,36,0.12)", color: "#fbbf24",
          border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8,
          padding: "12px 24px", fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        🔔 Notify Me When Available
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: "min(460px,100%)" }}>
            {state === "done" ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>You're on the list!</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                  We'll email you the moment <strong>{courseTitle}</strong> goes live — with a <strong>15% discount</strong> reserved for you.
                </p>
                <button onClick={() => { setOpen(false); setState("idle"); setForm({ name: "", email: "" }); }}
                  style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Got it
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Get notified</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
                  Be the first to know when <strong style={{ color: "var(--foreground)" }}>{courseTitle}</strong> launches.
                  You'll get a <strong style={{ color: "#fbbf24" }}>15% exclusive discount</strong> — waitlist only.
                </p>
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Your name</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Email address</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} placeholder="rahul@example.com" />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setOpen(false)}
                      style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={state === "loading"}
                      style={{ flex: 2, background: "#fbbf24", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: state === "loading" ? "not-allowed" : "pointer", opacity: state === "loading" ? 0.7 : 1, fontFamily: "inherit" }}>
                      {state === "loading" ? "Saving…" : "Notify Me →"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
