import { db } from "@/lib/db";
import GenerateCouponButton from "./GenerateCouponButton";

export default async function LeadsPage() {
  const [leads, coupons] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, include: { coupons: true } }),
    db.coupon.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const statusColor: Record<string, { bg: string; color: string; border: string }> = {
    unused:  { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    used:    { bg: "rgba(52,211,153,0.1)", color: "#34d399", border: "rgba(52,211,153,0.25)" },
    revoked: { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  };

  const reasonLabel: Record<string, string> = {
    syllabus_unlock:   "Syllabus unlock",
    course_completion: "Course completion",
    promotional:       "Promotional",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Leads & Coupons</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{leads.length} leads · {coupons.length} coupons</p>
        </div>
        <GenerateCouponButton />
      </div>

      {/* Leads */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Syllabus Unlock Leads</h2>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 40 }}>
        {leads.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No leads yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Name", "Email", "Phone", "Course", "Coupon", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{l.name}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{l.email}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{l.phone}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12 }}>{l.courseId}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {l.coupons[0]?.code ?? "—"}
                    {l.coupons[0] && (
                      <span style={{ fontSize: 11, marginLeft: 8, padding: "2px 8px", borderRadius: 100, ...statusColor[l.coupons[0].status] }}>
                        {l.coupons[0].status}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{l.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All coupons */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>All Coupons</h2>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {coupons.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No coupons yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Code", "Reason", "Discount", "Status", "Used at", "Created"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const s = statusColor[c.status] ?? statusColor.unused;
                return (
                  <tr key={c.code} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{c.code}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{reasonLabel[c.reason]}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#34d399" }}>{c.discount}%</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{c.status}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{c.usedAt?.toLocaleDateString("en-IN") ?? "—"}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{c.createdAt.toLocaleDateString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
