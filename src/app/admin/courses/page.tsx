"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Variant = {
  id: string;
  title: string;
  subjectLabel: string;
  level: string;
  price: number;
  duration: string;
  type: string;
  deliveryMode: string;
  hidden: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  masterclass: "Masterclass",
  cohort: "Weekend Cohort",
  sprint: "Sprint",
  "deep-dive": "Deep Dive",
  "full-course": "Full Course",
  "interview-prep": "Interview Prep",
  standard: "Classic",
};

const TYPE_ORDER = ["masterclass", "cohort", "sprint", "deep-dive", "full-course", "interview-prep", "standard"];

export default function AdminCoursesPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((data) => { setVariants(data); setLoading(false); });
  }, []);

  async function toggleHidden(courseId: string, current: boolean) {
    setToggling(courseId);
    await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, hidden: !current }),
    });
    setVariants((vs) => vs.map((v) => v.id === courseId ? { ...v, hidden: !current } : v));
    setToggling(null);
  }

  const visibleCount = variants.filter((v) => !v.hidden).length;

  if (loading) return <div style={{ color: "var(--text-muted)", padding: 40 }}>Loading courses…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Courses</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {variants.length} total · <span style={{ color: "#34d399" }}>{visibleCount} visible</span>
            {variants.length - visibleCount > 0 && (
              <span style={{ color: "var(--text-muted)" }}> · {variants.length - visibleCount} hidden</span>
            )}
          </p>
        </div>
      </div>

      {TYPE_ORDER.map((type) => {
        const group = variants.filter((v) => v.type === type);
        if (!group.length) return null;

        return (
          <div key={type} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100,
                background: "var(--surface-2)", color: "var(--text-dim)",
                border: "1px solid var(--border)", letterSpacing: "0.07em", textTransform: "uppercase" as const,
              }}>
                {TYPE_LABELS[type] ?? type}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{group.length} courses</span>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                    {["Visible", "Title", "Level", "Price", "Duration", "Mode", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "9px 18px", textAlign: "left" as const, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.map((v) => (
                    <tr key={v.id} style={{
                      borderBottom: "1px solid var(--border)",
                      opacity: v.hidden ? 0.45 : 1,
                      transition: "opacity 0.2s",
                    }}>
                      <td style={{ padding: "12px 18px" }}>
                        <button
                          onClick={() => toggleHidden(v.id, v.hidden)}
                          disabled={toggling === v.id}
                          title={v.hidden ? "Click to make visible" : "Click to hide"}
                          style={{
                            width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                            background: v.hidden ? "var(--border)" : "#34d399",
                            position: "relative" as const, transition: "background 0.2s",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{
                            position: "absolute" as const, top: 3, left: v.hidden ? 3 : 19,
                            width: 16, height: 16, borderRadius: "50%", background: "white",
                            transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }} />
                        </button>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{v.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{v.id}</div>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{v.level}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13 }}>₹{v.price.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{v.duration}</td>
                      <td style={{ padding: "12px 18px", fontSize: 12 }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 11,
                          background: v.deliveryMode === "Live" ? "rgba(52,211,153,0.1)" : "rgba(96,165,250,0.1)",
                          color: v.deliveryMode === "Live" ? "#34d399" : "#60a5fa",
                        }}>{v.deliveryMode}</span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <Link
                          href={`/admin/courses/${v.id}`}
                          style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", padding: "5px 12px", border: "1px solid var(--primary)", borderRadius: 6 }}
                        >
                          Edit
                        </Link>
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
