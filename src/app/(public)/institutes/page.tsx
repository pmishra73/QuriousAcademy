"use client";
import { useState } from "react";

const benefits = [
  { icon: "📐", title: "Curriculum-Aligned Courses", body: "We map our courses to your syllabus and learning outcomes — so students build on what they're already studying, not around it." },
  { icon: "🎓", title: "Student Progress Dashboard", body: "Faculty get a live view of attendance, completion, and assessment scores for every enrolled student." },
  { icon: "👩‍🏫", title: "Teacher Panel Access", body: "Your faculty can manage sessions, share resources, and send announcements directly through the Qurious Academy teacher panel." },
  { icon: "💰", title: "Institution Pricing", body: "Discounted bulk rates for student cohorts. Pay per semester or per batch — we'll find a structure that fits your budget." },
  { icon: "📜", title: "Co-Branded Certificates", body: "Completion certificates carry both the institution's name and Qurious Academy's seal — meaningful for students and verified online." },
  { icon: "🔬", title: "Across All Disciplines", body: "Programming, Mathematics, AI, Science, and Technology — courses that complement any STEM or commerce stream." },
];

const types = ["School (Class 6–12)", "Junior College / PUC", "Degree College", "University", "Coaching Institute", "Vocational / Skill Centre"];
const streams = ["Science & Mathematics", "Computer Science & IT", "AI & Data Science", "Commerce & Analytics", "Mixed / Interdisciplinary"];

export default function InstitutesPage() {
  const [form, setForm] = useState({ institution: "", type: "", name: "", email: "", phone: "", students: "", stream: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "institute",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `${form.institution} · ${form.type} · ${form.students} students · ${form.stream}`,
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
        <div className="glow-orb glow-orb-violet" style={{ top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 24 }}>🎓 For Institutes</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,60px)", marginBottom: 20, lineHeight: 1.15 }}>
            Bring <span className="gradient-text" style={{ fontStyle: "italic" }}>live expert learning</span> to your institution
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 36px" }}>
            Whether you're a school, college, or university — partner with Qurious Academy to give students access to live, expert-taught courses in AI, Programming, Mathematics, Science, and Technology.
          </p>
          <a href="#enquiry" style={{ background: "var(--primary)", color: "white", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 15, display: "inline-block" }}>
            Partner with us →
          </a>
        </div>
      </section>

      {/* Who we work with */}
      <section style={{ padding: "40px 24px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["Schools", "Junior Colleges", "Degree Colleges", "Universities", "Coaching Institutes", "Skill Centres"].map((t) => (
              <span key={t} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 100, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "44px 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", marginBottom: 12 }}>Built for educational institutions</h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto" }}>Everything you need to complement your academic programme with live, expert instruction.</p>
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
            <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", marginBottom: 10 }}>Start the conversation</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Tell us about your institution and we'll reach out within one business day.</p>
          </div>

          {state === "done" ? (
            <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 16, padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Enquiry received!</h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                We'll reach out to <strong>{form.email}</strong> within one business day to discuss how we can work with <strong>{form.institution}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Institution name *</label>
                  <input required value={form.institution} onChange={(e) => set("institution", e.target.value)} style={inputStyle} placeholder="Delhi Public School, RK Puram" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Institution type *</label>
                  <select required value={form.type} onChange={(e) => set("type", e.target.value)} style={inputStyle}>
                    <option value="">Select type</option>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Stream / discipline *</label>
                  <select required value={form.stream} onChange={(e) => set("stream", e.target.value)} style={inputStyle}>
                    <option value="">Select stream</option>
                    {streams.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Contact person *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} placeholder="Dr. Anita Mehta" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} placeholder="principal@dps.edu.in" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Phone *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Approx. number of students *</label>
                  <select required value={form.students} onChange={(e) => set("students", e.target.value)} style={inputStyle}>
                    <option value="">Select range</option>
                    {["Under 50", "50–150", "150–500", "500–1000", "1000+"].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Tell us more (optional)</label>
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="e.g. We want to offer AI electives to our final-year B.Tech students next semester..." />
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
