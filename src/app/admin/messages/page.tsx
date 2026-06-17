import { db } from "@/lib/db";
import MarkReadButton from "./MarkReadButton";

export default async function MessagesPage() {
  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Messages & Enquiries</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{unread} unread · {messages.length} total</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
            No messages yet.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ background: "var(--surface)", border: `1px solid ${m.read ? "var(--border)" : "rgba(91,124,250,0.3)"}`, borderRadius: 12, padding: "20px 24px", position: "relative" }}>
            {!m.read && (
              <span style={{ position: "absolute", top: 20, right: 24, width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "block" }} />
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: m.type === "contact" ? "rgba(91,124,250,0.12)" : "rgba(167,139,250,0.12)", color: m.type === "contact" ? "#5b7cfa" : "#a78bfa", border: `1px solid ${m.type === "contact" ? "rgba(91,124,250,0.2)" : "rgba(167,139,250,0.2)"}`, fontWeight: 600 }}>
                {m.type === "contact" ? "Contact" : "Teach with us"}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.email}</span>
              {m.phone && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.phone}</span>}
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{m.createdAt.toLocaleDateString("en-IN")}</span>
            </div>
            {m.subject && <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{m.subject}</div>}
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>{m.body}</p>
            {!m.read && (
              <div style={{ marginTop: 14 }}>
                <MarkReadButton id={m.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
