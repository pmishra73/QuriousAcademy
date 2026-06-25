"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CourseStatus = "active" | "coming_soon" | "hidden";

type Variant = {
  id: string;
  title: string;
  subjectLabel: string;
  level: string;
  price: number;
  duration: string;
  type: string;
  deliveryMode: string;
  status: CourseStatus;
};

const STATUS_OPTS: { value: CourseStatus; label: string; color: string; bg: string; border: string }[] = [
  { value: "active",      label: "Active",       color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)" },
  { value: "coming_soon", label: "Coming Soon",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)" },
  { value: "hidden",      label: "Hidden",       color: "#6b7280", bg: "var(--surface-2)",       border: "var(--border)" },
];

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
  const [waitlistCounts, setWaitlistCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(data => { setVariants(data); setLoading(false); });
    fetch("/api/admin/courses/waitlist").then(r => r.json()).then(d => { if (d) setWaitlistCounts(d); }).catch(() => {});
  }, []);

  async function setStatus(courseId: string, status: CourseStatus) {
    setToggling(courseId);
    await fetch(`/api/admin/courses/${courseId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setVariants(vs => vs.map(v => v.id === courseId ? { ...v, status } : v));
    setToggling(null);
  }

  const activeCount = variants.filter(v => v.status === "active").length;
  const comingSoonCount = variants.filter(v => v.status === "coming_soon").length;

  if (loading) return <div style={{ color: "var(--text-muted)", padding: 40 }}>Loading courses…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Courses</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {variants.length} total · <span style={{ color: "#34d399" }}>{activeCount} active</span>
            {comingSoonCount > 0 && <span style={{ color: "#fbbf24" }}> · {comingSoonCount} coming soon</span>}
            {variants.length - activeCount - comingSoonCount > 0 && <span> · {variants.length - activeCount - comingSoonCount} hidden</span>}
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
                    {["Status", "Title", "Waitlist", "Level", "Price", "Duration", "Mode", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "9px 18px", textAlign: "left" as const, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.map((v) => {
                    const s = STATUS_OPTS.find(o => o.value === (v.status ?? "active")) ?? STATUS_OPTS[0];
                    const wl = waitlistCounts[v.id] ?? 0;
                    return (
                    <tr key={v.id} style={{ borderBottom: "1px solid var(--border)", opacity: v.status === "hidden" ? 0.45 : 1, transition: "opacity 0.2s" }}>
                      <td style={{ padding: "12px 18px" }}>
                        <select
                          value={v.status ?? "active"}
                          disabled={toggling === v.id}
                          onChange={e => setStatus(v.id, e.target.value as CourseStatus)}
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", outline: "none" }}
                        >
                          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{v.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{v.id}</div>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {wl > 0 ? <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>{wl} waiting</span> : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>}
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
                  );})}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
