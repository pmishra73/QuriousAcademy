import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ChangeRequestActions from "./ChangeRequestActions";

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  owner_confirmed: { color: "#5b7cfa", background: "rgba(91,124,250,0.08)", border: "1px solid rgba(91,124,250,0.25)" },
  approved:        { color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)" },
  rejected:        { color: "#ef4444", background: "rgba(239,68,68,0.08)",  border: "1px solid rgba(239,68,68,0.25)" },
};

const STATUS_LABEL: Record<string, string> = {
  owner_confirmed: "You confirmed",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function TeacherChangeRequestsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id!;

  const [pending, history] = await Promise.all([
    db.contentChangeRequest.findMany({
      where: { ownerId: userId, status: "pending_owner" },
      orderBy: { createdAt: "desc" },
    }),
    db.contentChangeRequest.findMany({
      where: { ownerId: userId, status: { in: ["owner_confirmed", "approved", "rejected"] } },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Edit Requests</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {pending.length} pending request{pending.length !== 1 ? "s" : ""} from users, forwarded by admin
        </p>
      </div>

      {/* Pending */}
      {pending.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 40 }}>
          No pending edit requests.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {pending.map((r) => (
            <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{r.contentType}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.contentTitle}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>

              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Suggestion from {r.requestorName}</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--foreground)" }}>{r.suggestion}</p>
              </div>

              {r.adminNote && (
                <div style={{ fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  Admin note: {r.adminNote}
                </div>
              )}

              <ChangeRequestActions requestId={r.id} />
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            History
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Content", "From", "Suggestion", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{r.contentTitle}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{r.contentType}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-dim)" }}>{r.requestorName}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", maxWidth: 220 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.suggestion}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, ...STATUS_STYLE[r.status] }}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {r.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
