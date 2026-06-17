import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AddResourceButton from "./AddResourceButton";

export default async function TeacherResourcesPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

  const assignments = await db.courseAssignment.findMany({ where: { teacherId: userId } });
  const courseIds = assignments.map((a) => a.courseId);

  const resources = await db.resource.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { createdAt: "desc" },
  });

  const typeIcon: Record<string, string> = {
    slide: "📊", assignment: "📝", recording: "🎬", link: "🔗",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Resources</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{resources.length} files shared with students</p>
        </div>
        <AddResourceButton courseIds={courseIds} />
      </div>

      {resources.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          No resources yet. Add slides, assignments, or recording links above.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Type", "Title", "Course", "Added", ""].map((h) => (
                  <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>
                      {typeIcon[r.type] ?? "📎"} {r.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{r.title}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{r.courseId}</td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{r.createdAt.toLocaleDateString("en-IN")}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--primary)" }}>Open ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
