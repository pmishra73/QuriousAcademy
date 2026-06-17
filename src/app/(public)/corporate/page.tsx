"use client";
import { useState } from "react";

const benefits = [
  { icon: "👥", title: "Bulk Seats & Custom Cohorts", body: "Enrol your entire team in a dedicated batch — schedules, pace, and content tailored to your organisation's needs." },
  { icon: "📊", title: "Progress & Completion Tracking", body: "Track every employee's attendance, quiz scores, and completion status through a shared dashboard." },
  { icon: "🏆", title: "Verified Certificates", body: "Employees receive Qurious Academy certificates on course completion — recognised and shareable on LinkedIn." },
  { icon: "📄", title: "Invoice & GST Billing", body: "Corporate-friendly invoices with GST breakdowns. Pay per seat or buy a credit bundle for future use." },
  { icon: "🎯", title: "Custom Learning Paths", body: "We work with your L&D team to build a curriculum sequence that maps to your tech stack and growth goals." },
  { icon: "🤝", title: "Dedicated Account Manager", body: "A single point of contact for scheduling, support, and reporting — no back-and-forth with multiple teams." },
];

const sizes = ["1–10", "11–50", "51–200", "201–500", "500+"];
const interests = ["AI & Machine Learning", "Programming & Software", "Data & Mathematics", "Technology & Cloud", "Custom curriculum"];

export default function CorporatePage() {
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", size: "", interest: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "corporate",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `${form.company} · ${form.size} employees · ${form.interest}`,
        body: form.message || "(no additional message)",
      }),
    });
    setState(res.ok ? "done" : "error");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "var(--foreground)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "72px 24px 60px", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div className="glow-orb" style={{ top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 24 }}>🏢 For Corporates</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,60px)", marginBottom: 20, lineHeight: 1.15 }}>
            Upskill your team with <span className="gradient-text" style={{ fontStyle: "italic" }}>live expert training</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 36px" }}>
            From AI and programming to mathematics and data science — bring structured, live learning directly to your workforce. Custom cohorts, tracked progress, and invoice billing.
          </p>
          <a href="#enquiry" style={{ background: "var(--primary)", color: "white", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 15, display: "inline-block" }}>
            Get a custom quote →
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", marginBottom: 12 }}>Everything your L&D team needs</h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto" }}>We handle the training — you track the growth.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 20 }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 26px" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{b.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{b.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", marginBottom: 10 }}>Talk to us</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Fill in the form and we'll get back within one business day.</p>
          </div>

          {state === "done" ? (
            <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 16, padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>We've received your enquiry</h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                Our team will reach out to you at <strong>{form.email}</strong> within one business day to discuss a custom plan for your organisation.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Company name *</label>
                  <input required value={form.company} onChange={(e) => set("company", e.target.value)} style={inputStyle} placeholder="Acme Corp" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Your name *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} placeholder="Riya Sharma" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Work email *</label>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} placeholder="riya@acme.com" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Phone number *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Team size *</label>
                  <select required value={form.size} onChange={(e) => set("size", e.target.value)} style={inputStyle}>
                    <option value="">Select size</option>
                    {sizes.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Area of interest *</label>
                  <select required value={form.interest} onChange={(e) => set("interest", e.target.value)} style={inputStyle}>
                    <option value="">Select topic</option>
                    {interests.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Anything specific you'd like us to know? (optional)</label>
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="e.g. We want to train 30 engineers in Python and ML over 3 months..." />
              </div>
              {state === "error" && (
                <div style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  Something went wrong. Please try again or email us at hello@quriousacademy.com
                </div>
              )}
              <button type="submit" disabled={state === "loading"} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "13px", fontSize: 15, fontWeight: 600, cursor: state === "loading" ? "not-allowed" : "pointer", opacity: state === "loading" ? 0.7 : 1, fontFamily: "inherit" }}>
                {state === "loading" ? "Sending…" : "Send enquiry →"}
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>We respond within one business day · No spam, ever</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
