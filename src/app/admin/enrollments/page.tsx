import { db } from "@/lib/db";
import EnrollmentRow from "./EnrollmentRow";

export const dynamic = "force-dynamic";

export default async function EnrollmentsPage() {
  const enrollments = await db.enrollment.findMany({ orderBy: { createdAt: "desc" } });

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
              {enrollments.map((e) => (
                <EnrollmentRow key={e.id} e={{ ...e, studentPhone: e.studentPhone ?? null, createdAt: e.createdAt.toISOString() }} />
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
