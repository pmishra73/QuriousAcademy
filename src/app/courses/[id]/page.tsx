import { courses, getCourse } from "@/lib/courses";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) notFound();

  const spotsLeft = course.spots - course.enrolled;
  const pct = Math.round((course.enrolled / course.spots) * 100);

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }} className="grid-bg">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Link href="/courses" style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
            ← All Courses
          </Link>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                <span className="tag">{course.category}</span>
                <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 100, background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{course.level}</span>
              </div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{course.badge}</div>
              <h1 style={{ fontSize: "clamp(28px,4vw,48px)", marginBottom: 16 }}>{course.title}</h1>
              <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 600, marginBottom: 28 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Duration", value: course.duration },
                  { label: "Schedule", value: course.schedule },
                  { label: "Starts", value: course.startDate },
                  { label: "Instructor", value: course.instructor },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, minWidth: 280, position: "sticky", top: 80 }}>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>₹{course.price.toLocaleString("en-IN")}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>One-time payment · No EMI fees</div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span>{course.enrolled} enrolled</span>
                  <span style={{ color: spotsLeft <= 5 ? "#f97316" : "var(--text-muted)" }}>{spotsLeft} spots left</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--primary),var(--violet))", borderRadius: 2 }} />
                </div>
              </div>

              <Link href={`/enroll?course=${course.id}`}
                style={{ display: "block", textAlign: "center", background: "var(--primary)", color: "white", padding: "14px", borderRadius: 8, fontWeight: 500, fontSize: 15, marginBottom: 12 }}>
                Enroll Now →
              </Link>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
                Pay via UPI · Instant confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: 48 }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 24 }}>What you'll learn</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 48 }}>
              {course.outcomes.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <span style={{ color: "var(--primary)", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{o}</span>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 24, marginBottom: 24 }}>Course syllabus</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {course.syllabus.map((s, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 10 }}>{s.week}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {s.topics.map((t, j) => (
                      <span key={j} style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "3px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>Your instructor</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--primary),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", flexShrink: 0 }}>
                  {course.instructor[0]}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{course.instructor}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{course.instructorBio}</p>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>This course includes</h3>
              {[
                "Live interactive sessions",
                "Session recordings",
                "Doubt clearing sessions",
                "Practice assignments",
                "Certificate of completion",
                "Private community access",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--primary)", fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
