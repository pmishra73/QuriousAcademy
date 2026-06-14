import Link from "next/link";
import { courses } from "@/lib/courses";

const stats = [
  { value: "500+", label: "Students taught" },
  { value: "6", label: "Live courses" },
  { value: "4.9★", label: "Average rating" },
  { value: "12", label: "Expert instructors" },
];

const testimonials = [
  {
    name: "Ananya S.",
    role: "B.Tech Student, NIT Trichy",
    course: "Python Fundamentals",
    text: "Qurious Academy's Python course was the clearest programming class I've ever taken. The instructor made every concept click and the small batch size meant I could ask questions freely.",
  },
  {
    name: "Rohan M.",
    role: "Working Professional, Bengaluru",
    course: "Intro to AI & ML",
    text: "I'd been trying to break into ML for two years. After Qurious Academy's AI course, I built and deployed my first model. The hands-on approach is unmatched.",
  },
  {
    name: "Preethi K.",
    role: "Class 12 Student, Chennai",
    course: "Classical Mechanics",
    text: "Prof. Kavita explains physics in a way no textbook does. I went from dreading physics to actually loving it.",
  },
];

const categories = [
  { icon: "🐍", label: "Programming", desc: "Python, JavaScript, DSA and more", href: "/courses?cat=programming" },
  { icon: "∫", label: "Mathematics", desc: "Calculus, Discrete Maths, Statistics", href: "/courses?cat=maths" },
  { icon: "🤖", label: "AI & ML", desc: "Machine learning and modern AI systems", href: "/courses?cat=ai" },
  { icon: "⚛", label: "Science", desc: "Physics, Chemistry, Biology", href: "/courses?cat=science" },
  { icon: "💻", label: "Technology", desc: "Web, Cloud, Systems design", href: "/courses?cat=technology" },
];

export default function Home() {
  const featured = courses.slice(0, 3);

  return (
    <div>
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 24px 120px" }} className="grid-bg">
        <div className="glow-orb" style={{ top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-orb glow-orb-violet" style={{ bottom: -200, right: -100, width: 500, height: 500 }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="tag animate-fade-up stagger-1" style={{ marginBottom: 28, display: "inline-flex" }}>
            ✦ Live classes · Small batches · Expert instructors
          </div>
          <h1 className="animate-fade-up stagger-2" style={{ fontSize: "clamp(42px, 7vw, 76px)", marginBottom: 24 }}>
            Learn the subjects that{" "}
            <span className="gradient-text" style={{ fontStyle: "italic" }}>shape the future</span>
          </h1>
          <p className="animate-fade-up stagger-3" style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
            Qurious Academy offers live, interactive courses in Programming, Mathematics, AI, Science, and Technology.
            Learn from experts in small batches where every question gets answered.
          </p>
          <div className="animate-fade-up stagger-4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/courses" style={{ background: "var(--primary)", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15 }}>
              Explore Courses →
            </Link>
            <Link href="/about" style={{ background: "var(--surface-2)", color: "var(--text-dim)", padding: "14px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15, border: "1px solid var(--border)" }}>
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "32px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 36, marginBottom: 6, background: "linear-gradient(130deg,#5b7cfa,#8b6ff7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>What we teach</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", marginBottom: 16 }}>Five domains, one platform</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
              Structured courses across the subjects that matter most for building a strong technical foundation.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {categories.map((c) => (
              <Link key={c.label} href={c.href} className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px 24px", display: "block" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="tag" style={{ display: "inline-flex", marginBottom: 14 }}>Featured</div>
              <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>Courses enrolling now</h2>
            </div>
            <Link href="/courses" style={{ fontSize: 14, color: "var(--primary)", fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
            {featured.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, background: "var(--surface-2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid var(--border)" }}>{c.badge}</div>
                  <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 100, background: "rgba(91,124,250,0.1)", color: "var(--primary)", border: "1px solid rgba(91,124,250,0.2)", fontWeight: 500 }}>{c.level}</span>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: "var(--font-dm-serif)" }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>{c.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>₹{c.price.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.duration}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.spots - c.enrolled} spots left</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>Student stories</div>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>What our students say</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--primary),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "white", flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--primary)", background: "rgba(91,124,250,0.08)", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(91,124,250,0.15)" }}>{t.course}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }} className="grid-bg">
        <div className="glow-orb" style={{ bottom: -150, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(30px,5vw,52px)", marginBottom: 20 }}>
            Ready to <span className="gradient-text" style={{ fontStyle: "italic" }}>start learning?</span>
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
            Spots fill up fast. Join a batch of motivated learners with an expert instructor guiding you live.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/courses" style={{ background: "var(--primary)", color: "white", padding: "14px 32px", borderRadius: 8, fontWeight: 500, fontSize: 15 }}>Browse Courses →</Link>
            <Link href="/teach" style={{ background: "var(--surface-2)", color: "var(--text-dim)", padding: "14px 32px", borderRadius: 8, fontWeight: 500, fontSize: 15, border: "1px solid var(--border)" }}>Teach on Qurious Academy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
