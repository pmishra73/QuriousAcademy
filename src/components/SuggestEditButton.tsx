"use client";
import { useState } from "react";

type Props = {
  contentType: "blog" | "video";
  contentId: string;
  contentTitle: string;
  ownerId: string;
};

export default function SuggestEditButton({ contentType, contentId, contentTitle, ownerId }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", suggestion: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    await fetch("/api/content-change-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentId, contentTitle, ownerId, ...form }),
    });
    setState("done");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-2, #1a1f35)", border: "1px solid var(--border, rgba(255,255,255,0.08))",
    borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground, #eef2ff)",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ fontSize: 12, color: "var(--text-muted, #9ba8c4)", background: "none", border: "1px solid var(--border, rgba(255,255,255,0.08))", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}
      >
        ✏️ Suggest an edit
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "var(--surface, #0f1322)", border: "1px solid var(--border, rgba(255,255,255,0.08))", borderRadius: 16, padding: 32, width: "min(480px, 95vw)", maxHeight: "90vh", overflowY: "auto" }}>
            {state === "done" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Thank you!</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted, #9ba8c4)", lineHeight: 1.6, marginBottom: 24 }}>
                  Your suggestion has been submitted. If accepted, you'll receive a 10% discount coupon by email.
                </p>
                <button onClick={() => { setOpen(false); setState("idle"); setForm({ name: "", email: "", suggestion: "" }); }}
                  style={{ background: "var(--primary, #5b7cfa)", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Suggest an Edit</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted, #9ba8c4)", marginBottom: 22, lineHeight: 1.5 }}>
                  Found something to improve in <strong style={{ color: "var(--foreground, #eef2ff)" }}>{contentTitle}</strong>? If accepted, you'll get a 10% coupon as thanks.
                </p>
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted, #9ba8c4)", display: "block", marginBottom: 5 }}>Your name</label>
                    <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted, #9ba8c4)", display: "block", marginBottom: 5 }}>Your email</label>
                    <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} placeholder="rahul@example.com" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted, #9ba8c4)", display: "block", marginBottom: 5 }}>What would you like to change or improve?</label>
                    <textarea required value={form.suggestion} onChange={(e) => set("suggestion", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" as const }} placeholder="Describe the change clearly — e.g. 'In section 2, the example uses X but should use Y because…'" />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--surface-2, #1a1f35)", border: "1px solid var(--border, rgba(255,255,255,0.08))", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", color: "var(--text-dim, #6b7280)", fontFamily: "inherit" }}>Cancel</button>
                    <button type="submit" disabled={state === "loading"} style={{ flex: 2, background: "#5b7cfa", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: state === "loading" ? "not-allowed" : "pointer", opacity: state === "loading" ? 0.7 : 1, fontFamily: "inherit" }}>
                      {state === "loading" ? "Submitting…" : "Submit Suggestion"}
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
