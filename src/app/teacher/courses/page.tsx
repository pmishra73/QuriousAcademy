import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import Link from "next/link";

export default async function TeacherCoursesPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id!;
  const role = (session?.user as { role?: string })?.role;

  const isAdmin = role === "admin";
  let courseIds: string[];
  if (isAdmin) {
    courseIds = variants.map(v => v.id);
  } else {
    const assignments = await db.courseAssignment.findMany({ where: { teacherId: userId } });
    courseIds = assignments.map(a => a.courseId);
  }

  const approvals = await db.courseApproval.findMany({ where: { courseId: { in: courseIds } } });
  const approvalMap = Object.fromEntries(approvals.map(a => [a.courseId, a.status]));

  const myCourses = variants.filter(v => courseIds.includes(v.id));

  const statusStyle: Record<string, React.CSSProperties> = {
    approved: { color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)" },
    pending:  { color: "#fbbf24", background: "rgba(251,191,36,0.08)",  border: "1px solid rgba(251,191,36,0.25)" },
    rejected: { color: "#ef4444", background: "rgba(239,68,68,0.08)",   border: "1px solid rgba(239,68,68,0.25)" },
    draft:    { color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>My Courses</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Build course content for your assigned courses. Submit for admin review to publish.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
        {myCourses.map(c => {
          const status = approvalMap[c.id] ?? "draft";
          const ss = statusStyle[status];
          return (
            <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{c.type}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{c.title}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, ...ss }}>{status}</span>
                <Link href={`/teacher/courses/${c.id}/build`}
                  style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500, marginLeft: "auto" }}>
                  {status === "draft" ? "Build Content →" : "Edit Content →"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
