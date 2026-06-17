"use client";
import { useState } from "react";

export default function ChangePasswordForm({ accentColor = "var(--primary)" }: { accentColor?: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) { setMsg({ type: "err", text: "New passwords do not match." }); return; }
    if (next.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters." }); return; }
    setLoading(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setMsg({ type: "ok", text: "Password changed successfully." });
      setCurrent(""); setNext(""); setConfirm("");
    } else {
      setMsg({ type: "err", text: data.error ?? "Something went wrong." });
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      {[
        { label: "Current password", value: current, set: setCurrent },
        { label: "New password", value: next, set: setNext },
        { label: "Confirm new password", value: confirm, set: setConfirm },
      ].map(({ label, value, set }) => (
        <div key={label}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
          <input type="password" required value={value} onChange={(e) => set(e.target.value)} style={inputStyle} />
        </div>
      ))}

      {msg && (
        <div style={{
          fontSize: 13, padding: "10px 14px", borderRadius: 8,
          background: msg.type === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${msg.type === "ok" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
          color: msg.type === "ok" ? "#34d399" : "#ef4444",
        }}>
          {msg.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: accentColor, color: "white", border: "none", borderRadius: 8,
          padding: "11px 20px", fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          fontFamily: "inherit", alignSelf: "flex-start",
        }}
      >
        {loading ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
