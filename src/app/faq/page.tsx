"use client";
import { useState } from "react";

const faqs = [
  { q: "Are all classes live?", a: "Yes, every Qurious Academy class is live. We don't believe in pre-recorded content — live classes mean you can ask questions and get answers in real time from your instructor." },
  { q: "What if I miss a class?", a: "Every session is recorded and shared with enrolled students within 24 hours. You'll never fall behind due to a missed class." },
  { q: "How does payment work?", a: "We currently accept UPI payments. You pay directly, share your transaction ID, and we confirm your seat within 4 hours. If we can't verify, you get a full refund." },
  { q: "What is the refund policy?", a: "If your payment can't be verified, it's fully refunded. Once enrolled, we offer refunds within 48 hours of the first class if you're unsatisfied for any reason — no questions asked." ,  id: "refund" },
  { q: "Will I get a certificate?", a: "Yes, every student who completes a course receives a Qurious Academy certificate of completion." },
  { q: "What software or tools do I need?", a: "Just a browser and a stable internet connection. We use Google Meet or Zoom for live classes — both are free and work on any device." },
  { q: "Can I switch batches?", a: "Yes, if a seat is available in another batch of the same course, we'll accommodate you. Just email us before the second class." },
  { q: "How do I become an instructor on Qurious Academy?", a: "Apply via our Teach on Qurious Academy page. We review every application and get back to you within 3 business days." },
  { q: "Do you offer group or institutional discounts?", a: "Yes! If you're enrolling 5 or more students from the same institution or organisation, contact us for a group rate." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>FAQ</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Common questions</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>
            Everything you need to know about how Qurious Academy works.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {faqs.map((f, i) => (
            <div key={i} id={(f as { id?: string }).id} style={{ borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16, color: "var(--foreground)", fontFamily: "inherit" }}>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{f.q}</span>
                <span style={{ fontSize: 20, color: "var(--primary)", flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: "48px auto 0", textAlign: "center", padding: "32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <div style={{ fontSize: 20, marginBottom: 12 }}>Still have questions?</div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>Can't find what you're looking for? We're here to help.</p>
          <a href="/contact" style={{ background: "var(--primary)", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 500, fontSize: 14, display: "inline-block" }}>Contact us →</a>
        </div>
      </section>
    </div>
  );
}
