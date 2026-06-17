import { variants, typeConfig } from "@/lib/variants";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const assignments = await db.courseAssignment.findMany({ include: { teacher: true } });
  const teacherMap: Record<string, string> = {};
  for (const a of assignments) teacherMap[a.courseId] = a.teacher.name;

  const enrollCounts = await db.enrollment.groupBy({
    by: ["courseId"],
    where: { status: "confirmed" },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(enrollCounts.map((e) => [e.courseId, e._count.id]));

  const typeOrder = ["masterclass", "cohort", "sprint", "deep-dive", "standard"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Courses</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{variants.length} variants across all subjects</p>
        </div>
      </div>

      {typeOrder.map((type) => {
        const group = variants.filter((v) => v.type === type);
        if (!group.length) return null;
        const cfg = typeConfig[type as keyof typeof typeConfig];
        return (
          <div key={type} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {cfg.icon} {cfg.label}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{group.length} courses</span>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                    {["Title", "Subject", "Level", "Price", "Duration", "Teacher", "Enrolled"].map((h) => (
                      <th key={h} style={{ padding: "9px 18px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 18px" }}>
                        <Link href={`/courses/${v.id}`} target="_blank" style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{v.title}</Link>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{v.subjectLabel}</td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{v.level}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13 }}>₹{v.price.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{v.duration}</td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: teacherMap[v.id] ? "var(--foreground)" : "var(--text-muted)" }}>
                        {teacherMap[v.id] ?? <span style={{ fontStyle: "italic" }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#34d399" }}>
                        {countMap[v.id] ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
