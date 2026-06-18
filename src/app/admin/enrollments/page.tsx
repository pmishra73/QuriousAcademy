import { db } from "@/lib/db";

export default async function EnrollmentsPage() {
  const enrollments = await db.enrollment.findMany({ orderBy: { createdAt: "desc" } });

  const statusColor: Record<string, { bg: string; color: string; border: string }> = {
    confirmed: { bg: "rgba(52,211,153,0.1)", color: "#34d399", border: "rgba(52,211,153,0.25)" },
    pending:   { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    refunded:  { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Enrollments</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{enrollments.length} total</p>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {enrollments.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            No enrollments yet.
          </div>
        ) : (
          <div className="table-scroll-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Student", "Email", "Phone", "Course", "Amount", "Coupon", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const s = statusColor[e.status] ?? statusColor.pending;
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{e.studentName}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentEmail}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentPhone}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12 }}>{e.courseId}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>
                      ₹{(e.amountPaid / 100).toLocaleString("en-IN")}
                      {e.discountApplied > 0 && <span style={{ fontSize: 11, color: "#34d399", marginLeft: 6 }}>-{e.discountApplied}%</span>}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{e.couponCode ?? "—"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{e.createdAt.toLocaleDateString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
