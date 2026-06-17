import { db } from "@/lib/db";
import Link from "next/link";

async function getStats() {
  const [enrollments, leads, coupons, messages, upcomingSessions] = await Promise.all([
    db.enrollment.count({ where: { status: "confirmed" } }),
    db.lead.count(),
    db.coupon.count({ where: { status: "used" } }),
    db.message.count({ where: { read: false } }),
    db.session.count({ where: { status: "scheduled", scheduledAt: { gte: new Date() } } }),
  ]);

  const revenue = await db.enrollment.aggregate({
    _sum: { amountPaid: true },
    where: { status: "confirmed" },
  });

  const recentEnrollments = await db.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { enrollments, leads, coupons, messages, upcomingSessions, revenue: (revenue._sum.amountPaid ?? 0) / 100, recentEnrollments };
}

const statCards = (s: Awaited<ReturnType<typeof getStats>>) => [
  { label: "Confirmed Enrollments", value: s.enrollments, color: "#5b7cfa", href: "/admin/enrollments" },
  { label: "Total Revenue", value: `₹${s.revenue.toLocaleString("en-IN")}`, color: "#34d399", href: "/admin/enrollments" },
  { label: "Leads Captured", value: s.leads, color: "#f59e0b", href: "/admin/leads" },
  { label: "Coupons Redeemed", value: s.coupons, color: "#a78bfa", href: "/admin/leads" },
  { label: "Unread Messages", value: s.messages, color: "#f472b6", href: "/admin/messages" },
  { label: "Upcoming Sessions", value: s.upcomingSessions, color: "#22d3ee", href: "/admin/courses" },
];

export default async function AdminDashboard() {
  const stats = await getStats();
  const cards = statCards(stats);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Welcome back. Here's what's happening.</p>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent enrollments */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Enrollments</h2>
          <Link href="/admin/enrollments" style={{ fontSize: 12, color: "var(--primary)" }}>View all →</Link>
        </div>
        {stats.recentEnrollments.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No enrollments yet. They'll appear here once students enroll.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Student", "Course", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 24px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentEnrollments.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 24px", fontSize: 13 }}>{e.studentName}</td>
                  <td style={{ padding: "12px 24px", fontSize: 13, color: "var(--text-dim)" }}>{e.courseId}</td>
                  <td style={{ padding: "12px 24px", fontSize: 13 }}>₹{(e.amountPaid / 100).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 24px" }}>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                      background: e.status === "confirmed" ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
                      color: e.status === "confirmed" ? "#34d399" : "#f59e0b",
                      border: `1px solid ${e.status === "confirmed" ? "rgba(52,211,153,0.25)" : "rgba(245,158,11,0.25)"}`,
                    }}>{e.status}</span>
                  </td>
                  <td style={{ padding: "12px 24px", fontSize: 12, color: "var(--text-muted)" }}>{e.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
