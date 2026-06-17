import { variants, typeConfig } from "@/lib/variants";
import { courses, getCourse } from "@/lib/courses";
import { getAllPostsMeta } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import VariantDetailClient from "./VariantDetailClient";

export function generateStaticParams() {
  const variantIds = variants.map((v) => ({ id: v.id }));
  const oldIds = courses.map((c) => ({ id: c.id })).filter((c) => !variants.find((v) => v.id === c.id));
  return [...variantIds, ...oldIds];
}

const subjectToCategory: Record<string, string> = {
  python: "Programming", programming: "Programming",
  ai: "AI & ML", maths: "Mathematics",
  science: "Science", technology: "Technology",
};

const levelColors: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)" },
  intermediate: { color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.25)" },
  advanced:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
  "all levels": { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)" },
};
function levelStyle(level: string) {
  return levelColors[level.toLowerCase()] ?? { color: "var(--text-muted)", bg: "var(--surface-2)", border: "var(--border)" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try variant first (the new JSON-based courses)
  const variant = variants.find((v) => v.id === id);
  if (variant) {
    const cfg = typeConfig[variant.type];
    const levels = variant.level.split(/[,/]|\s+to\s+/i).map((l) => l.trim()).filter(Boolean);
    const relatedPosts = getAllPostsMeta().filter(
      (p) => p.category === subjectToCategory[variant.subject]
    ).slice(0, 3);

    return (
      <div>
        {/* Hero */}
        <section style={{ padding: "56px 24px 44px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }} className="grid-bg">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Link href="/courses" style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
              ← All Courses
            </Link>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 36, alignItems: "start" }}>
              <div>
                {/* Type + level tags */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>{cfg.icon} {cfg.label}</span>
                  {levels.map((lvl) => {
                    const ls = levelStyle(lvl);
                    return (
                      <span key={lvl} style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
                        background: ls.bg, color: ls.color, border: `1px solid ${ls.border}`,
                        textTransform: "capitalize",
                      }}>{lvl}</span>
                    );
                  })}
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{variant.subjectLabel}</span>
                </div>

                <h1 style={{ fontSize: "clamp(26px,4vw,46px)", marginBottom: 12, lineHeight: 1.2 }}>{variant.title}</h1>
                <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 600, marginBottom: 28 }}>{variant.content.overview}</p>

                <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                  {[
                    { label: "Duration", value: variant.duration },
                    { label: "Instructor", value: variant.instructor },
                    { label: "Certificate", value: variant.content.certificate },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price card */}
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, minWidth: 260, position: "sticky", top: 80 }}>
                <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 4 }}>₹{variant.price.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>One-time payment · No EMI fees</div>
                <Link href={`/enroll?course=${variant.id}`}
                  style={{ display: "block", textAlign: "center", background: "var(--primary)", color: "white", padding: "13px", borderRadius: 8, fontWeight: 500, fontSize: 14, marginBottom: 10 }}>
                  Enroll Now →
                </Link>
                {/* Syllabus unlock button — needs client interaction */}
                <VariantDetailClient variant={variant} cfg={cfg} />
                <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
                  🎁 Unlock syllabus to get a <strong>10% off coupon</strong> by email
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section style={{ padding: "48px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: 48 }}>
            <div>
              {/* Sessions */}
              <h2 style={{ fontSize: 22, marginBottom: 20 }}>Session breakdown</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
                {variant.content.sessions.map((s, i) => (
                  <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: cfg.color,
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        padding: "2px 10px", borderRadius: 100, flexShrink: 0,
                      }}>{s.session}</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {s.topics.map((t, j) => (
                        <span key={j} style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "3px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Outcomes */}
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>What you'll walk away with</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 48 }}>
                {variant.content.outcomes.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <span style={{ color: cfg.color, flexShrink: 0, fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{o}</span>
                  </div>
                ))}
              </div>

              {/* Prerequisites + Includes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Prerequisites</div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{variant.content.prerequisites}</p>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>This course includes</div>
                  {variant.content.includes.map((inc, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: cfg.color, flexShrink: 0 }}>✓</span>{inc}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Instructor */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.07em" }}>Your instructor</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <img src="/founder.png" alt={variant.instructor} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "center top", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{variant.instructor}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>GenAI Solutions Architect</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.65 }}>
                  15+ years teaching experience · 2500+ students · Programmer, Systems Architect, and GenAI specialist.
                </p>
                <a href="https://pmishra73.github.io" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10 }}>
                  View profile ↗
                </a>
              </div>

              {/* Related articles */}
              {relatedPosts.length > 0 && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.07em" }}>Related reading</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {relatedPosts.map((p) => (
                      <Link key={p.slug} href={`/blog/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.4, marginBottom: 3 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.readTime} read</div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/blog" style={{ fontSize: 12, color: "var(--primary)", display: "inline-block", marginTop: 14 }}>All articles →</Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Fall back to old course format
  const course = getCourse(id);
  if (!course) notFound();

  const spotsLeft = course.spots - course.enrolled;
  const pct = Math.round((course.enrolled / course.spots) * 100);

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }} className="grid-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
                {[{ label: "Duration", value: course.duration }, { label: "Instructor", value: course.instructor }].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, minWidth: 260 }}>
              <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 4 }}>₹{course.price.toLocaleString("en-IN")}</div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span>{course.enrolled} enrolled</span>
                  <span>{spotsLeft} spots left</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--primary),var(--violet))", borderRadius: 2 }} />
                </div>
              </div>
              <Link href={`/enroll?course=${course.id}`} style={{ display: "block", textAlign: "center", background: "var(--primary)", color: "white", padding: "13px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}>
                Enroll Now →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
