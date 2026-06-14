"use client";
import { useState } from "react";

export default function TeachPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", experience: "", bio: "", portfolio: "" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/teach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setStatus("success"); else setStatus("error");
    } catch { setStatus("error"); }
  };

  const inp = { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8, padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%" } as React.CSSProperties;
  const lbl = { fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "100px 24px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div>
      <h2 style={{ fontSize: 32, marginBottom: 12 }}>Application submitted!</h2>
      <p style={{ color: "var(--text-dim)", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>
        We'll review your application and get back to you within 2–3 business days.
      </p>
    </div>
  );

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>For Instructors</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Teach on Qurious Academy</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>
            Share your expertise with motivated students. We handle scheduling, payments, and student communications —
            you focus on teaching.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 28 }}>Instructor application</h2>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input style={inp} value={form.name} onChange={set("name")} placeholder="Your name" required />
                </div>
                <div>
                  <label style={lbl}>Phone Number *</label>
                  <input style={inp} type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 ..." required />
                </div>
              </div>
              <div>
                <label style={lbl}>Email Address *</label>
                <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={lbl}>Subject / Domain *</label>
                <select style={inp} value={form.subject} onChange={set("subject")} required>
                  <option value="">Select a subject</option>
                  {["Python / Programming", "Mathematics", "AI & Machine Learning", "Physics", "Chemistry", "Web Development", "Data Science", "Other"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Years of Teaching / Industry Experience *</label>
                <select style={inp} value={form.experience} onChange={set("experience")} required>
                  <option value="">Select</option>
                  {["< 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Bio — Tell us about yourself *</label>
                <textarea style={{ ...inp, minHeight: 140, resize: "vertical" }} value={form.bio} onChange={set("bio")} placeholder="Your background, expertise, teaching philosophy..." required />
              </div>
              <div>
                <label style={lbl}>Portfolio / LinkedIn / GitHub (optional)</label>
                <input style={inp} type="url" value={form.portfolio} onChange={set("portfolio")} placeholder="https://..." />
              </div>
              {status === "error" && (
                <div style={{ fontSize: 13, color: "#f97316", padding: "10px 14px", background: "rgba(249,115,22,0.08)", borderRadius: 8, border: "1px solid rgba(249,115,22,0.2)" }}>
                  Something went wrong. Please try again or email us directly.
                </div>
              )}
              <button type="submit" disabled={status === "loading"}
                style={{ background: "var(--primary)", color: "white", padding: "14px", borderRadius: 8, fontWeight: 500, fontSize: 15, cursor: "pointer", border: "none", fontFamily: "inherit", opacity: status === "loading" ? 0.7 : 1 }}>
                {status === "loading" ? "Submitting..." : "Submit Application →"}
              </button>
            </form>
          </div>

          <div style={{ position: "sticky", top: 80 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Why teach on Qurious Academy?</h3>
            {[
              { icon: "💰", title: "Competitive pay", desc: "Earn per student enrolled. Transparent revenue share model." },
              { icon: "📅", title: "Flexible scheduling", desc: "You set your availability. We build the batch around you." },
              { icon: "🎯", title: "Small batches", desc: "Max 20 students per batch — meaningful teaching, not webinars." },
              { icon: "🛠", title: "We handle logistics", desc: "Payments, student comms, scheduling — all on us." },
              { icon: "🌱", title: "Grow with us", desc: "Build a reputation and student community on Qurious Academy." },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 20 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
