import Link from "next/link";

const enrolled = [
  { id: "python-fundamentals", title: "Python Fundamentals", badge: "🐍", nextClass: "Saturday, Jul 12 · 10:00 AM IST", instructor: "Arjun Mehta", joinLink: "#", progress: 35 },
  { id: "intro-to-ai-ml", title: "Introduction to AI & ML", badge: "🤖", nextClass: "Saturday, Jul 19 · 2:00 PM IST", instructor: "Siddharth Rao", joinLink: "#", progress: 10 },
];

export default function DashboardPage() {
  return (
    <div style={{ padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>Dashboard</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 15 }}>Your enrolled courses and upcoming sessions.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48 }}>
          {[
            { label: "Courses enrolled", value: enrolled.length },
            { label: "Sessions completed", value: 4 },
            { label: "Hours learned", value: "6h 30m" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 28, marginBottom: 4, color: "var(--primary)" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Your courses</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {enrolled.map((c) => (
            <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, background: "var(--surface-2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid var(--border)" }}>{c.badge}</div>
                <div>
                  <h3 style={{ fontSize: 17, marginBottom: 4 }}>{c.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>with {c.instructor}</p>
                  <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden", maxWidth: 320 }}>
                    <div style={{ height: "100%", width: `${c.progress}%`, background: "linear-gradient(90deg,var(--primary),var(--violet))", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{c.progress}% complete</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Next class</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{c.nextClass}</div>
                  <a href={c.joinLink} style={{ background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: 7, fontWeight: 500, fontSize: 13, display: "inline-block" }}>Join Class →</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
            <h2 style={{ fontSize: 18 }}>Explore more courses</h2>
            <Link href="/courses" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>View all →</Link>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Continue building your skills. We have courses in Mathematics, AI & ML, Science, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
