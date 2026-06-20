import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import Link from "next/link";

export default async function TeacherHome() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "admin";

  let courseIds: string[];
  if (isAdmin) {
    courseIds = variants.map((v) => v.id);
  } else {
    const assignments = await db.courseAssignment.findMany({ where: { teacherId: userId } });
    courseIds = assignments.map((a) => a.courseId);
  }

  const myCourses = isAdmin ? variants : variants.filter((v) => courseIds.includes(v.id));

  const enrollmentCounts = courseIds.length > 0 ? await db.enrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds }, status: "confirmed" },
    _count: { id: true },
  }) : [];
  const countMap = Object.fromEntries(enrollmentCounts.map((e) => [e.courseId, e._count.id]));

  const upcomingSessions = courseIds.length > 0 ? await db.session.findMany({
    where: { courseId: { in: courseIds }, status: "scheduled", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  }) : [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Courses</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>You are assigned to {myCourses.length} course{myCourses.length !== 1 ? "s" : ""}.</p>
      </div>

      {myCourses.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No courses assigned yet. Contact admin to get assigned.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 40 }}>
          {myCourses.map((c) => (
            <Link key={c.id} href={`/teacher/students?course=${c.id}`} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{c.type}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{c.title}</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Enrolled</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#34d399" }}>{countMap[c.id] ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Duration</div>
                  <div style={{ fontSize: 13 }}>{c.duration}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {upcomingSessions.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Upcoming Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingSessions.map((s) => (
              <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.scheduledAt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                {s.meetingLink && (
                  <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--primary)" }}>Join →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
