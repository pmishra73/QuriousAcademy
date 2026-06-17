import Link from "next/link";
import { courses } from "@/lib/courses";

const categories = [
  { icon: "🐍", label: "Programming", desc: "Python, JavaScript, DSA and more", href: "/courses?subject=python" },
  { icon: "∫", label: "Mathematics", desc: "Calculus, Discrete Maths, Statistics", href: "/courses?subject=maths" },
  { icon: "🤖", label: "AI & ML", desc: "Machine learning and modern AI systems", href: "/courses?subject=ai" },
  { icon: "⚛", label: "Science", desc: "Physics, Chemistry, Biology", href: "/courses?subject=science" },
  { icon: "💻", label: "Technology", desc: "Web, Cloud, Systems design", href: "/courses?subject=technology" },
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
            AI is the Tool.{" "}
            <span className="gradient-text" style={{ fontStyle: "italic" }}>You are the Architect.</span>
          </h1>
          <p className="animate-fade-up stagger-3" style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 40px" }}>
            Learn the fundamental subjects you need to command the technology of tomorrow — taught live by expert mentors.
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
