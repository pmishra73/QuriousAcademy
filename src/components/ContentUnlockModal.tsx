"use client";
import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import type { CourseVariant } from "@/lib/variants";
import { typeConfig } from "@/lib/variants";

const SESSION_KEY = "qa_contact";

function CourseIcon({ name, size = 36 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name];
  if (!Icon) return <span style={{ fontSize: size }}>{name}</span>;
  return <Icon size={size} strokeWidth={1.5} />;
}

type Props = {
  variant: CourseVariant;
  onClose: () => void;
};

type Step = "gate" | "content";

export default function ContentUnlockModal({ variant, onClose }: Props) {
  const [step, setStep] = useState<Step>("gate");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [prefilled, setPrefilled] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);
  const cfg = typeConfig[variant.type];

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(parsed);
        setPrefilled(true);
      }
    } catch {}
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(form)); } catch {}
    setStep("content");
    fetch("/api/unlock-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId: variant.id, courseTitle: variant.title }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.couponCode) setCoupon(data.couponCode); })
      .catch(() => {});
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    color: "var(--foreground)", borderRadius: 8, padding: "11px 14px",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, color: "var(--text-muted)", display: "block",
    marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  const handleDownload = () => {
    const content = buildTextContent(variant);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant.id}-course-content.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(5,8,18,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, width: "100%", maxWidth: step === "content" ? 720 : 460,
          maxHeight: "90vh", overflow: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, background: "var(--surface)", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {cfg.label}
            </div>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{variant.title}</span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 20, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        {step === "gate" ? (
          <div style={{ padding: 28 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: cfg.color }}>
                <CourseIcon name={variant.icon} size={40} />
              </div>
              <h2 style={{ fontSize: 21, marginBottom: 10, lineHeight: 1.3 }}>
                See the full syllabus &amp; get 10% off
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>
                Get instant access to the complete session-by-session breakdown for <strong style={{ color: "var(--foreground)" }}>{variant.title}</strong> — every topic, outcome, and what's included. We'll also email you a <strong style={{ color: "#34d399" }}>10% discount coupon</strong> to use whenever you're ready to enrol.
              </p>
            </div>

            {prefilled && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 8,
                background: "rgba(91,124,250,0.08)", border: "1px solid rgba(91,124,250,0.2)",
                fontSize: 13, color: "var(--primary)",
              }}>
                We remembered you from earlier — just hit the button below.
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Your Name *</label>
                <input style={inp} value={form.name} onChange={set("name")} placeholder="Full name" required />
              </div>
              <div>
                <label style={lbl}>Email Address *</label>
                <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={lbl}>Phone Number *</label>
                <input style={inp} type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" required />
              </div>
              <button type="submit" style={{
                marginTop: 6, background: "var(--primary)", color: "white",
                border: "none", borderRadius: 8, padding: "13px", fontSize: 15,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
                {prefilled ? "Show me the syllabus →" : "Get syllabus + 10% off coupon →"}
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                No spam — just the syllabus and your coupon code.
              </p>
            </form>
          </div>
        ) : (
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Course overview</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>{variant.content.overview}</p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28,
              padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
            }}>
              {[
                { label: "Duration", value: variant.duration },
                { label: "Level", value: variant.level },
                { label: "Instructor", value: variant.instructor },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Sessions */}
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Session Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {variant.content.sessions.map((s, i) => (
                <div key={i} style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: cfg.color,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      padding: "2px 10px", borderRadius: 100,
                    }}>{s.session}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {s.topics.map((t, j) => (
                      <span key={j} style={{
                        fontSize: 12, color: "var(--text-muted)",
                        background: "var(--surface)", padding: "3px 10px",
                        borderRadius: 6, border: "1px solid var(--border)",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>What you'll walk away with</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {variant.content.outcomes.map((o, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "12px 14px",
                }}>
                  <span style={{ color: cfg.color, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{o}</span>
                </div>
              ))}
            </div>

            {/* Prerequisites + Includes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Prerequisites</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{variant.content.prerequisites}</p>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>This course includes</div>
                {variant.content.includes.map((inc, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4, display: "flex", gap: 8 }}>
                    <span style={{ color: cfg.color }}>✓</span>{inc}
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon banner */}
            {coupon ? (
              <div style={{
                marginBottom: 20, padding: "14px 18px", borderRadius: 10,
                background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600, marginBottom: 3 }}>🎁 Your 10% off coupon</div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.12em" }}>{coupon}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Also sent to {form.email} · one-time use only</div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(coupon); }}
                  style={{ fontSize: 12, padding: "7px 14px", background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Copy code
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-muted)", padding: "12px 16px", background: "var(--surface-2)", borderRadius: 8 }}>
                ⏳ Sending your 10% coupon to {form.email}…
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <a href={`/enroll?course=${variant.id}`} style={{
                flex: 1, textAlign: "center", background: "var(--primary)", color: "white",
                padding: "13px", borderRadius: 8, fontWeight: 500, fontSize: 14,
                display: "block",
              }}>
                Enroll — ₹{variant.price.toLocaleString("en-IN")} →
              </a>
              <button onClick={handleDownload} style={{
                padding: "13px 20px", background: "var(--surface-2)", color: "var(--text-dim)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 14,
                fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ↓ Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildTextContent(v: CourseVariant): string {
  const lines = [
    `QUBIT — COURSE CONTENT`,
    `${"═".repeat(48)}`,
    ``,
    `${v.title}`,
    `${v.subjectLabel} · ${typeConfig[v.type].label}`,
    ``,
    `Duration : ${v.duration}`,
    `Level    : ${v.level}`,
    `Instructor: ${v.instructor}`,
    `Price    : ₹${v.price.toLocaleString("en-IN")}`,
    ``,
    `OVERVIEW`,
    `${"─".repeat(40)}`,
    v.content.overview,
    ``,
    `SESSION BREAKDOWN`,
    `${"─".repeat(40)}`,
    ...v.content.sessions.flatMap((s) => [
      ``,
      `${s.session} — ${s.title}`,
      ...s.topics.map((t) => `  • ${t}`),
    ]),
    ``,
    `WHAT YOU'LL LEARN`,
    `${"─".repeat(40)}`,
    ...v.content.outcomes.map((o) => `  ✓ ${o}`),
    ``,
    `PREREQUISITES`,
    `${"─".repeat(40)}`,
    `  ${v.content.prerequisites}`,
    ``,
    `THIS COURSE INCLUDES`,
    `${"─".repeat(40)}`,
    ...v.content.includes.map((i) => `  ✓ ${i}`),
    ``,
    `${"═".repeat(48)}`,
    `Enroll at quriousacademy.com/enroll?course=${v.id}`,
    `Questions? hello@quriousacademy.com`,
  ];
  return lines.join("\n");
}
