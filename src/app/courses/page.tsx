"use client";
import { useState } from "react";
import Link from "next/link";
import { variants, typeConfig, sectionOrder, getVariantsByType, getUpcomingForVariant } from "@/lib/variants";
import type { CourseVariant } from "@/lib/variants";
import ContentUnlockModal from "@/components/ContentUnlockModal";

const sectionMeta = {
  masterclass: {
    heading: "Masterclasses",
    sub: "3 hours · Happen once a month · High-signal, no fluff",
    desc: "Intensive single-session deep dives. Perfect if you want clarity on a topic fast.",
  },
  cohort: {
    heading: "Intensive Cohorts",
    sub: "1–2 days · Two weekends per month · Small groups",
    desc: "Weekend immersions. Come in knowing nothing, leave with real skills and projects.",
  },
  sprint: {
    heading: "Sprint Courses",
    sub: "Under 1 month · Ongoing batches",
    desc: "Focused, time-boxed courses for busy people who want results fast.",
  },
  standard: {
    heading: "Full Courses",
    sub: "1–3 months · Structured learning",
    desc: "Thorough, structured programs for learners who want to go deep and build a solid foundation.",
  },
  "deep-dive": {
    heading: "Deep Dives",
    sub: "90+ days · New batches weekly · Career-track",
    desc: "Comprehensive programs for learners who want to reach job-ready or research-ready proficiency.",
  },
} as const;

function VariantCard({ v, onUnlock }: { v: CourseVariant; onUnlock: (v: CourseVariant) => void }) {
  const cfg = typeConfig[v.type];
  const dates = getUpcomingForVariant(v);

  return (
    <div className="card-hover" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 0,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{
          width: 44, height: 44, background: "var(--surface-2)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, border: "1px solid var(--border)", flexShrink: 0,
        }}>{v.icon}</div>
        <div style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{v.level}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{v.subjectLabel}</div>
      <h3 style={{ fontSize: 17, marginBottom: 6, lineHeight: 1.3, fontFamily: "var(--font-dm-serif)" }}>{v.title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 16 }}>{v.tagline}</p>

      {/* Instructor + duration */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[v.instructor.split(" ")[0] + " " + (v.instructor.split(" ")[1]?.[0] ?? "") + ".", v.duration].map((t, i) => (
          <span key={i} style={{
            fontSize: 11, color: "var(--text-muted)", background: "var(--surface-2)",
            padding: "3px 10px", borderRadius: 6, border: "1px solid var(--border)",
          }}>{t}</span>
        ))}
      </div>

      {/* Upcoming dates */}
      {dates.length > 0 && (
        <div style={{
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 18,
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Upcoming dates
          </div>
          {dates.map((d, i) => (
            <div key={i} style={{
              fontSize: 12, color: cfg.color, fontWeight: 500,
              paddingTop: i > 0 ? 4 : 0, marginTop: i > 0 ? 4 : 0,
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
            }}>◎ {d}</div>
          ))}
        </div>
      )}

      {/* Price + CTAs */}
      <div style={{
        marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>₹{v.price.toLocaleString("en-IN")}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.duration}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onUnlock(v)} style={{
            fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 7,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}>
            See Syllabus ↓
          </button>
          <Link href={`/enroll?course=${v.id}`} style={{
            fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 7,
            background: "var(--primary)", color: "white", whiteSpace: "nowrap",
          }}>
            Enroll →
          </Link>
        </div>
      </div>
    </div>
  );
}

const classTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "masterclass", label: "MasterClass" },
  { value: "cohort", label: "Cohort" },
  { value: "deep-dive", label: "Deep Dive" },
];

export default function CoursesPage() {
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [unlockTarget, setUnlockTarget] = useState<CourseVariant | null>(null);

  const subjects = ["all", ...Array.from(new Set(variants.map((v) => v.subject)))];
  const subjectLabels: Record<string, string> = {
    all: "All Subjects", python: "Python", ai: "AI & ML",
    maths: "Mathematics", science: "Science", technology: "Technology",
    programming: "Programming",
  };

  const filteredVariants = (type: CourseVariant["type"]) => {
    if (activeType !== "all" && type !== activeType) return [];
    return getVariantsByType(type).filter((v) => activeSubject === "all" || v.subject === activeSubject);
  };

  return (
    <div style={{ minHeight: "80vh" }}>
      {/* Hero */}
      <section style={{ padding: "64px 24px 32px", background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }} className="grid-bg">
        <div className="glow-orb" style={{ top: -200, left: "30%", width: 500, height: 500 }} />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>All Courses</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", marginBottom: 16 }}>Find the right format for you</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
            From 3-hour masterclasses to 90-day deep dives — every subject available at the depth that fits your schedule and goals.
          </p>
        </div>
      </section>

      {/* Sticky filters */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--background)", borderBottom: "1px solid var(--border)",
        padding: "12px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Subject filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4, flexShrink: 0 }}>Subject</span>
            {subjects.map((s) => (
              <button key={s} onClick={() => setActiveSubject(s)} style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                borderColor: activeSubject === s ? "var(--primary)" : "var(--border)",
                background: activeSubject === s ? "rgba(91,124,250,0.12)" : "var(--surface-2)",
                color: activeSubject === s ? "var(--primary)" : "var(--text-dim)",
                transition: "all 0.15s", fontFamily: "inherit",
              }}>
                {subjectLabels[s] ?? s}
              </button>
            ))}
          </div>
          {/* Class type filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4, flexShrink: 0 }}>Type</span>
            {classTypeOptions.map((opt) => (
              <button key={opt.value} onClick={() => setActiveType(opt.value)} style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                borderColor: activeType === opt.value ? "var(--primary)" : "var(--border)",
                background: activeType === opt.value ? "rgba(91,124,250,0.12)" : "var(--surface-2)",
                color: activeType === opt.value ? "var(--primary)" : "var(--text-dim)",
                transition: "all 0.15s", fontFamily: "inherit",
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: "0 24px 80px" }}>
        {sectionOrder.map((type) => {
          const cards = filteredVariants(type);
          if (cards.length === 0) return null;
          const meta = sectionMeta[type];
          const cfg = typeConfig[type];

          return (
            <section key={type} style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 0 0" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>{cfg.icon} {meta.heading}</div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{meta.sub}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 520 }}>{meta.desc}</p>
                </div>
              </div>

              {/* Cards grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
                {cards.map((v) => (
                  <VariantCard key={v.id} v={v} onUnlock={setUnlockTarget} />
                ))}
              </div>

              <div style={{ borderBottom: "1px solid var(--border)", marginTop: 56 }} />
            </section>
          );
        })}

        {/* 1-on-1 premium section */}
        {(activeSubject === "all" && activeType === "all") && (
          <section style={{ maxWidth: 1200, margin: "56px auto 0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: "rgba(251,191,36,0.08)", color: "#fbbf24",
                    border: "1px solid rgba(251,191,36,0.2)",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>★ 1-on-1 Classes</div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Premium · Any subject · Custom content</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 520 }}>
                  Completely personalised. You set the pace, the topics, and the depth. A discovery call first — then we design the course around you.
                </p>
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(91,124,250,0.06) 100%)",
              border: "1px solid rgba(251,191,36,0.15)", borderRadius: 16,
              padding: "40px 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: 40,
              alignItems: "center",
            }}>
              <div>
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>Your own personal instructor</h3>
                <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20, maxWidth: 540 }}>
                  A 1-on-1 engagement starts with a free discovery call where we understand your goals, current level, and schedule. We then design a custom syllabus and agree on pricing together — no fixed rates, because no two learners are the same.
                </p>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {["Any subject or combination", "Custom syllabus built for you", "Your schedule, your pace", "Free discovery call first"].map((f) => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-dim)" }}>
                      <span style={{ color: "#fbbf24" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Pricing by discussion</div>
                <a href="mailto:hello@quriousacademy.com?subject=1-on-1 Class Enquiry" style={{
                  display: "inline-block", background: "#fbbf24", color: "#0a0e1a",
                  padding: "13px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                }}>
                  Email to Book a Call →
                </a>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>hello@quriousacademy.com</div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modal */}
      {unlockTarget && (
        <ContentUnlockModal variant={unlockTarget} onClose={() => setUnlockTarget(null)} />
      )}
    </div>
  );
}
