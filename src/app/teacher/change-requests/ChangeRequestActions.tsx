"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangeRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(action);
    await fetch(`/api/content-change-request/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note.trim() || undefined }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => act("owner_confirm")}
          disabled={!!loading}
          style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
        >
          {loading === "owner_confirm" ? "Confirming…" : "Yes, I'll make this change"}
        </button>
        <button
          onClick={() => act("owner_decline")}
          disabled={!!loading}
          style={{ flex: 1, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
        >
          {loading === "owner_decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </div>
  );
}
