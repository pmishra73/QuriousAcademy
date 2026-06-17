import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import SendAnnouncementButton from "./SendAnnouncementButton";

export default async function TeacherAnnouncementsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

  const assignments = await db.courseAssignment.findMany({ where: { teacherId: userId } });
  const courseIds = assignments.map((a) => a.courseId);

  const announcements = await db.announcement.findMany({
    where: { teacherId: userId },
    orderBy: { sentAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Announcements</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Emails sent to enrolled students</p>
        </div>
        <SendAnnouncementButton courseIds={courseIds} />
      </div>

      {announcements.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No announcements sent yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {announcements.map((a) => (
            <div key={a.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", fontWeight: 600 }}>{a.courseId}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{a.subject}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                  {a.sentAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
