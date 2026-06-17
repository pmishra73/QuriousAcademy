import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import MarkCompleteButton from "./MarkCompleteButton";

export default async function TeacherStudentsPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const { course: filterCourse } = await searchParams;

  const assignments = await db.courseAssignment.findMany({ where: { teacherId: userId } });
  const courseIds = assignments.map((a) => a.courseId);
  const activeCourse = filterCourse && courseIds.includes(filterCourse) ? filterCourse : courseIds[0];

  const enrollments = activeCourse
    ? await db.enrollment.findMany({
        where: { courseId: activeCourse, status: "confirmed" },
        orderBy: { createdAt: "asc" },
        include: { notes: { where: { teacherId: userId }, orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : [];

  // Check which enrollments have completion coupons (proxy for "completed")
  const completedIds = new Set(
    (await db.coupon.findMany({ where: { reason: "course_completion", completionEnrollmentId: { in: enrollments.map((e) => e.id) } }, select: { completionEnrollmentId: true } }))
      .map((c) => c.completionEnrollmentId!)
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Students</h1>
        {courseIds.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {courseIds.map((id) => (
              <a key={id} href={`?course=${id}`} style={{
                fontSize: 12, padding: "5px 14px", borderRadius: 100, cursor: "pointer",
                background: activeCourse === id ? "rgba(52,211,153,0.12)" : "var(--surface)",
                color: activeCourse === id ? "#34d399" : "var(--text-dim)",
                border: `1px solid ${activeCourse === id ? "rgba(52,211,153,0.3)" : "var(--border)"}`,
                fontWeight: activeCourse === id ? 600 : 400,
              }}>{id}</a>
            ))}
          </div>
        )}
      </div>

      {enrollments.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          {activeCourse ? "No confirmed enrollments for this course yet." : "No courses assigned."}
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", fontSize: 12, color: "var(--text-muted)" }}>
            {enrollments.length} student{enrollments.length !== 1 ? "s" : ""} · {activeCourse}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Email", "Phone", "Enrolled on", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const completed = completedIds.has(e.id);
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{e.studentName}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentEmail}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentPhone}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{e.createdAt.toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                        background: completed ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
                        color: completed ? "#34d399" : "#f59e0b",
                        border: `1px solid ${completed ? "rgba(52,211,153,0.25)" : "rgba(245,158,11,0.25)"}`,
                      }}>
                        {completed ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {!completed && (
                        <MarkCompleteButton
                          enrollmentId={e.id}
                          studentName={e.studentName}
                          studentEmail={e.studentEmail}
                          studentPhone={e.studentPhone}
                          courseId={e.courseId}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
