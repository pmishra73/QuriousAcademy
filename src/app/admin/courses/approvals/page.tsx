"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Approval = { courseId: string; status: string; adminNote?: string; submittedAt?: string; teacher: { name: string; email: string } };

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending:  { color: "#fbbf24", background: "rgba(251,191,36,0.08)",  border: "1px solid rgba(251,191,36,0.25)" },
  approved: { color: "#34d399", background: "rgba(52,211,153,0.08)",  border: "1px solid rgba(52,211,153,0.25)" },
  rejected: { color: "#ef4444", background: "rgba(239,68,68,0.08)",   border: "1px solid rgba(239,68,68,0.25)" },
  draft:    { color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" },
};

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  function load() {
    fetch("/api/admin/courses/approvals").then(r => r.json()).then(d => setApprovals(Array.isArray(d) ? d : []));
  }
  useEffect(() => { load(); }, []);

  async function act(courseId: string, action: "approve" | "reject") {
    setLoading(l => ({ ...l, [courseId]: true }));
    await fetch(`/api/admin/courses/approvals/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNote: notes[courseId] }),
    });
    setLoading(l => ({ ...l, [courseId]: false }));
    load();
  }

  const pending = approvals.filter(a => a.status === "pending");
  const rest = approvals.filter(a => a.status !== "pending");

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Course Approvals</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Review teacher-built course content before it goes live on the platform.</p>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Pending Review ({pending.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {pending.map(a => (
              <div key={a.courseId} style={{ background: "var(--surface)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{a.courseId}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>by {a.teacher.name} · submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-IN") : "—"}</div>
                  </div>
                  <Link href={`/learn/${a.courseId}`} target="_blank" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", alignSelf: "flex-start" }}>Preview →</Link>
                </div>
                <textarea
                  value={notes[a.courseId] ?? ""}
                  onChange={e => setNotes(n => ({ ...n, [a.courseId]: e.target.value }))}
                  placeholder="Admin note to teacher (optional)"
                  rows={2}
                  style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", resize: "vertical" as const, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => act(a.courseId, "approve")} disabled={loading[a.courseId]}
                    style={{ background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: loading[a.courseId] ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading[a.courseId] ? 0.7 : 1 }}>
                    {loading[a.courseId] ? "…" : "Approve & Publish"}
                  </button>
                  <button onClick={() => act(a.courseId, "reject")} disabled={loading[a.courseId]}
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: loading[a.courseId] ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>History</div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Course", "Teacher", "Status", "Note", ""].map(h => (
                    <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rest.map(a => (
                  <tr key={a.courseId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{a.courseId}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{a.teacher.name}</td>
                    <td style={{ padding: "12px 20px" }}><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, ...STATUS_STYLE[a.status] }}>{a.status}</span></td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", maxWidth: 200 }}>{a.adminNote ?? "—"}</td>
                    <td style={{ padding: "12px 20px" }}><Link href={`/learn/${a.courseId}`} target="_blank" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>Preview →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {approvals.length === 0 && (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No course submissions yet.
        </div>
      )}
    </div>
  );
}
