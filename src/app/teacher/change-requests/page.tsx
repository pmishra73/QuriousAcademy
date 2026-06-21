import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ChangeRequestActions from "./ChangeRequestActions";

export default async function TeacherChangeRequestsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id!;

  const requests = await db.contentChangeRequest.findMany({
    where: { ownerId: userId, status: "pending_owner" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Edit Requests</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {requests.length} pending request{requests.length !== 1 ? "s" : ""} from users, forwarded by admin
        </p>
      </div>

      {requests.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No pending edit requests.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {requests.map((r) => (
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
    </div>
  );
}
