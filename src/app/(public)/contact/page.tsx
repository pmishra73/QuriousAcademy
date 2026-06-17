"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(f => ({...f,[k]:e.target.value}));
  const inp = { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8, padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%" } as React.CSSProperties;
  const lbl = { fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
  };

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>Get in touch</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Contact us</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>We read every message and respond within 24 hours.</p>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>✉</div>
              <h2 style={{ fontSize: 28, marginBottom: 12 }}>Message sent!</h2>
              <p style={{ color: "var(--text-dim)", fontSize: 15 }}>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Send us a message</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={lbl}>Name *</label><input style={inp} value={form.name} onChange={set("name")} placeholder="Your name" required /></div>
                <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required /></div>
              </div>
              <div><label style={lbl}>Message *</label>
                <textarea style={{ ...inp, minHeight: 180, resize: "vertical" }} value={form.message} onChange={set("message")} placeholder="How can we help?" required />
              </div>
              <button type="submit" disabled={status === "loading"}
                style={{ background: "var(--primary)", color: "white", padding: "14px", borderRadius: 8, fontWeight: 500, fontSize: 15, cursor: "pointer", border: "none", fontFamily: "inherit" }}>
                {status === "loading" ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}

          <div>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Other ways to reach us</h3>
            {[
              { icon: "✉", label: "Email", value: "hello@quriousacademy.com", href: "mailto:hello@quriousacademy.com" },
              { icon: "⏱", label: "Response time", value: "Within 24 hours", href: null },
              { icon: "📍", label: "Based in", value: "India 🇮🇳", href: null },
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 18, color: "var(--primary)" }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
                  {c.href ? <a href={c.href} style={{ fontSize: 15, color: "var(--primary)" }}>{c.value}</a> : <div style={{ fontSize: 14 }}>{c.value}</div>}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 28, padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Looking for something specific?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/faq" style={{ fontSize: 13, color: "var(--primary)" }}>→ Browse FAQs</a>
                <a href="/courses" style={{ fontSize: 13, color: "var(--primary)" }}>→ View all courses</a>
                <a href="/teach" style={{ fontSize: 13, color: "var(--primary)" }}>→ Apply to teach</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
