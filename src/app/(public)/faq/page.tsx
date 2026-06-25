"use client";
import { useState } from "react";
import Link from "next/link";

type FAQ = { q: string; a: string; id?: string };

const sections: { key: string; label: string; faqs: FAQ[] }[] = [
  {
    key: "students",
    label: "For Students",
    faqs: [
      { q: "Are all classes live?", a: "Yes, every Qurious Academy class is live. We don't believe in pre-recorded content — live classes mean you can ask questions and get real-time answers from your instructor." },
      { q: "What if I miss a class?", a: "Every session is recorded and shared with enrolled students within 24 hours. You'll never fall behind due to a missed class." },
      { q: "How does payment work?", a: "We use Razorpay for secure online payments — cards, UPI, net banking, and wallets are all supported. Your seat is confirmed immediately after payment." },
      { q: "What is the refund policy?", a: "We offer a full refund within 48 hours of your first class if you're unsatisfied for any reason — no questions asked. After that, refunds are handled case-by-case.", id: "refund" },
      { q: "Will I get a certificate?", a: "Yes. Every student who completes a course receives a Qurious Academy certificate of completion, which you can share on LinkedIn or add to your resume." },
      { q: "What software or tools do I need?", a: "Just a browser and a stable internet connection. We use Google Meet or Zoom for live classes — both are free and work on any device." },
      { q: "Can I switch batches?", a: "Yes. If a seat is available in another batch of the same course, we'll accommodate you. Just email us before the second class." },
      { q: "How small are the batches?", a: "We keep batches small — typically 8 to 15 students — so every student gets individual attention and the instructor knows your name and progress." },
      { q: "Are there prerequisites for courses?", a: "Each course page lists the recommended background. Most of our Sprint and Cohort courses assume basic familiarity, while Masterclasses are designed for beginners. When in doubt, email us and we'll advise." },
      { q: "How do I access the course content after enrollment?", a: "You'll receive a confirmation email with your course portal link. Recordings are shared within 24 hours of each session, and course materials are available throughout the course duration." },
      { q: "Can I use a coupon code?", a: "Yes. Enter your coupon code at checkout and the discount will be applied automatically. Coupons are one-time use and cannot be combined." },
      { q: "What happens if a class is cancelled?", a: "In the rare case a class is cancelled, you'll be notified at least 12 hours in advance and the session will be rescheduled at the earliest slot convenient for the batch." },
    ],
  },
  {
    key: "corporates",
    label: "For Corporates",
    faqs: [
      { q: "Do you offer corporate training programmes?", a: "Yes. We design and deliver custom training programmes for teams — from technical upskilling (DSA, Python, AI, Web Dev) to analytical thinking and problem-solving workshops." },
      { q: "Can you train our employees on-site?", a: "We offer both online (live) and on-site training, depending on your location and team size. Contact us to discuss logistics." },
      { q: "Do you offer group discounts?", a: "Yes. Groups of 5 or more students from the same organisation receive a discount starting at 15%. Contact us directly for a custom quote." },
      { q: "How long is a typical corporate programme?", a: "This depends on the depth required. We offer compact 2-day workshops, 4-week intensive sprints, and multi-month deep dives. All can be customised." },
      { q: "Can you build a custom curriculum?", a: "Absolutely. We'll start with a scoping call to understand your team's current level, goals, and constraints — and design a curriculum from scratch." },
      { q: "Do your corporate programmes include assessments?", a: "Yes. We can include quizzes, assignments, live code reviews, and final assessments with detailed feedback for each participant." },
      { q: "Will participants get certificates?", a: "Yes. All participants who complete the programme receive a Qurious Academy certificate. For larger organisations, we can co-brand certificates upon request." },
      { q: "How do we get started?", a: "Email us at hello@quriousacademy.com or use the contact form. We'll schedule a 30-minute discovery call and send you a proposal within 2 business days." },
    ],
  },
  {
    key: "institutes",
    label: "For Institutes",
    faqs: [
      { q: "Can our institute partner with Qurious Academy?", a: "Yes. We partner with coaching institutes, colleges, and education organisations to offer co-branded courses and shared revenue models." },
      { q: "What does an institute partnership look like?", a: "Partnerships vary — from guest sessions by our instructors, to white-labelled full courses on your platform, to co-branded marketing and joint batches. We'll tailor it to your context." },
      { q: "Do you offer revenue sharing for referrals?", a: "Yes. If an institute refers students who enrol in our courses, we have a referral programme in place. Reach out to discuss the terms." },
      { q: "Can our teachers teach on Qurious Academy?", a: "Yes. If your teachers meet our quality bar (we do a brief demo session evaluation), they can teach on the platform under their own profile, with institute affiliation shown." },
      { q: "How does content ownership work?", a: "Any content created by a teacher associated with your institute is teacher-owned but institute-affiliated. Revenue is shared between the teacher, the institute, and the platform according to the agreed model." },
      { q: "Can we get a custom subdomain for our institute?", a: "Yes. Institute partners get a branded subdomain (e.g. yourinstitute.quriousacademy.com) with your own logo, colour scheme, and course listing." },
      { q: "What support do you provide to partner institutes?", a: "We provide onboarding, a dedicated point of contact, platform access, analytics, and marketing support including co-branded collateral." },
    ],
  },
  {
    key: "teachers",
    label: "For Teachers",
    faqs: [
      { q: "How do I apply to teach on Qurious Academy?", a: "Apply through our Teach on Qurious Academy page. We review every application and respond within 3 business days. We look for subject expertise, communication clarity, and a passion for teaching." },
      { q: "What subjects can I teach?", a: "We're open to all STEM and technology subjects — programming, data structures, AI/ML, mathematics, science, web development, and more. If you have a unique subject you'd like to propose, tell us." },
      { q: "How is revenue shared?", a: "Teachers receive a share of the course revenue based on the agreed model. The exact percentage depends on whether you bring your own students, use our platform's reach, or both." },
      { q: "Can I set my own schedule?", a: "Yes. You propose your preferred class times and batch structure. We'll coordinate with student availability and find a slot that works." },
      { q: "Do I need to create course content beforehand?", a: "Not necessarily for live classes. However, we do encourage teachers to build a curriculum outline and at least a few reference materials before the first session." },
      { q: "How do I build and manage my courses on the platform?", a: "You get access to the Teacher Dashboard, where you can use the Course Builder to structure your content into Parts, Chapters, and Lessons. You can also manage sessions, students, and resources from one place." },
      { q: "What happens if I need to cancel a session?", a: "Inform us as early as possible — ideally 24 hours in advance. We'll help reschedule and notify enrolled students. Frequent cancellations affect your profile rating." },
      { q: "Can I teach under an institute?", a: "Yes. If you're affiliated with a partner institute, your profile will reflect that. Revenue and content ownership are governed by the institute partnership agreement." },
      { q: "Will Qurious Academy help me market my courses?", a: "Yes. Approved courses are featured on our platform, promoted via our social channels, and included in relevant email campaigns. Top-performing teachers also get dedicated spotlight features." },
      { q: "How do I get paid?", a: "Payouts are processed monthly via bank transfer. You'll receive a monthly statement with a breakdown of enrollments, revenue, and your share." },
    ],
  },
];

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState("students");
  const [open, setOpen] = useState<number | null>(null);

  const current = sections.find(s => s.key === activeSection)!;

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>FAQ</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Common questions</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>
            Everything you need to know — for students, corporates, institutes, and teachers.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {sections.map(s => (
              <button key={s.key} onClick={() => { setActiveSection(s.key); setOpen(null); }}
                style={{
                  padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: activeSection === s.key ? 600 : 400,
                  cursor: "pointer", border: "1px solid", fontFamily: "inherit",
                  borderColor: activeSection === s.key ? "var(--primary)" : "var(--border)",
                  background: activeSection === s.key ? "rgba(91,124,250,0.1)" : "var(--surface-2)",
                  color: activeSection === s.key ? "var(--primary)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {current.faqs.map((faq, i) => (
              <div key={i} id={faq.id}
                style={{ background: "var(--surface)", border: `1px solid ${open === i ? "rgba(91,124,250,0.3)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.15s" }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 22px 20px", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, borderTop: "1px solid var(--border)" }}>
                    <div style={{ paddingTop: 16 }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 56, padding: "32px 36px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Still have questions?</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>We usually respond within a few hours.</div>
            </div>
            <Link href="/contact" style={{ background: "var(--primary)", color: "white", padding: "11px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none", whiteSpace: "nowrap" }}>
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
