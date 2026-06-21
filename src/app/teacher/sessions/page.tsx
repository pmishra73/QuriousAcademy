import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import AddSessionButton from "./AddSessionButton";

export default async function TeacherSessionsPage() {
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

  const courses = variants
    .filter((v) => courseIds.includes(v.id))
    .map((v) => ({ id: v.id, title: v.title }));

  const sessions = courseIds.length > 0 ? await db.session.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { scheduledAt: "asc" },
  }) : [];

  const statusColor: Record<string, { bg: string; color: string; border: string }> = {
    scheduled:  { bg: "rgba(91,124,250,0.1)",  color: "#5b7cfa", border: "rgba(91,124,250,0.25)" },
    completed:  { bg: "rgba(52,211,153,0.1)",  color: "#34d399", border: "rgba(52,211,153,0.25)" },
    cancelled:  { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Sessions</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{sessions.length} sessions across your courses</p>
        </div>
        <AddSessionButton courses={courses} />
      </div>

      {sessions.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No sessions yet. Add your first session above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((s) => {
            const sc = statusColor[s.status];
            return (
              <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: s.notes ? 8 : 0 }}>
                      {s.courseId} · {s.scheduledAt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} at {s.scheduledAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {s.notes && <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>{s.notes}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "var(--primary)", padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(91,124,250,0.3)", background: "rgba(91,124,250,0.08)" }}>
                        Join ↗
                      </a>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
