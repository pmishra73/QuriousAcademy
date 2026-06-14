import Link from "next/link";

const values = [
  { icon: "◎", title: "Clarity first", desc: "We believe every concept can be explained clearly. If it's confusing, we haven't found the right explanation yet." },
  { icon: "⊡", title: "Small batches, real learning", desc: "Maximum 20 students per cohort. We're building understanding, not subscriber counts." },
  { icon: "△", title: "Depth over breadth", desc: "We'd rather teach one topic really well than skim ten. Our courses are built for lasting understanding." },
  { icon: "◈", title: "Live and interactive", desc: "No pre-recorded videos. All classes are live, so you can ask questions and get answers in real time." },
];

export default function AboutPage() {
  return (
    <div>
      <section style={{ padding: "80px 24px 64px", background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }} className="grid-bg">
        <div className="glow-orb" style={{ top: -200, right: -100 }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>About Qurious Academy</div>
          <h1 style={{ fontSize: "clamp(36px,5vw,60px)", marginBottom: 24 }}>
            Learning, done with <span className="gradient-text" style={{ fontStyle: "italic" }}>intention</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 600 }}>
            Qurious Academy was built on a simple frustration: most online courses are either too shallow to be useful,
            or so vast they become overwhelming. We set out to build something different —
            focused, live, and built around the learner.
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", marginBottom: 24 }}>Our mission</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 20 }}>
              We want every student in India to have access to world-class instruction in the subjects that matter
              most — regardless of where they live or which school they attend.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 20 }}>
              Programming, mathematics, AI, science, technology — these are the foundations of the modern world.
              We teach them rigorously, with expert instructors who love their subjects and love teaching.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              Qurious Academy is not a platform that scales through automation. It scales through quality — by training
              excellent instructors and giving them the tools to teach small, focused groups of motivated students.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { v: "2024", l: "Founded" }, { v: "500+", l: "Students" },
              { v: "4.9 / 5", l: "Avg rating" }, { v: "100%", l: "Live classes" },
            ].map((s) => (
              <div key={s.l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 32, background: "linear-gradient(130deg,#5b7cfa,#8b6ff7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>{s.v}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 72px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>What we stand for</div>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>Our values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {values.map((v) => (
              <div key={v.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
                <div style={{ fontSize: 24, color: "var(--primary)", marginBottom: 16, fontFamily: "monospace" }}>{v.icon}</div>
                <h3 style={{ fontSize: 17, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>Founder</div>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>The person behind Qurious Academy</h2>
          </div>
          <a href="https://pmishra73.github.io/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <div className="card-hover" style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
              padding: "40px 48px", display: "flex", alignItems: "center", gap: 36,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,var(--primary),var(--violet))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, color: "white", fontWeight: 700,
              }}>P</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: "var(--foreground)" }}>Prasant Mishra</div>
                <div style={{ fontSize: 14, color: "var(--primary)", marginBottom: 12 }}>Founder & Instructor</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                  Educator, builder, and the driving force behind Qurious Academy. Passionate about making rigorous, live learning accessible to every curious mind in India.
                </p>
              </div>
              <div style={{ fontSize: 13, color: "var(--primary)", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                View profile <span style={{ fontSize: 16 }}>↗</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section style={{ padding: "72px 24px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", marginBottom: 16 }}>Want to teach with us?</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
            We're always looking for passionate instructors who love their subject and love sharing it.
          </p>
          <Link href="/teach" style={{ background: "var(--primary)", color: "white", padding: "14px 32px", borderRadius: 8, fontWeight: 500, fontSize: 15, display: "inline-block" }}>
            Apply to Teach →
          </Link>
        </div>
      </section>
    </div>
  );
}
