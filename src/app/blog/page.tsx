import Link from "next/link";

const posts = [
  { slug: "learn-python-2025", title: "How to actually learn Python in 2025", date: "May 28, 2025", category: "Programming", readTime: "6 min", excerpt: "Most Python tutorials send you straight to syntax. Here's what to do instead — and why building projects is the fastest path to fluency.", author: "Arjun Mehta" },
  { slug: "why-calculus-matters", title: "Why calculus matters more than ever (and how to learn it)", date: "May 20, 2025", category: "Mathematics", readTime: "8 min", excerpt: "From ML gradients to physics simulations — calculus is everywhere. A guide to learning it the right way, without drowning in formulas.", author: "Dr. Priya Nair" },
  { slug: "ai-explained-simply", title: "What is machine learning, really? A plain-English explanation", date: "May 14, 2025", category: "AI & ML", readTime: "5 min", excerpt: "No jargon, no hype. Just a clear explanation of what ML models actually do — and why they're so powerful right now.", author: "Siddharth Rao" },
  { slug: "physics-intuition", title: "Building physical intuition before tackling equations", date: "May 6, 2025", category: "Science", readTime: "7 min", excerpt: "The biggest mistake physics students make is diving into equations before building intuition. Here's a better approach.", author: "Prof. Kavita Sharma" },
  { slug: "dsa-beginners", title: "Data structures for absolute beginners — where to start", date: "Apr 28, 2025", category: "Programming", readTime: "9 min", excerpt: "Arrays, linked lists, trees, graphs — it's overwhelming. This guide cuts through the noise and tells you exactly what to learn first.", author: "Arjun Mehta" },
  { slug: "web-dev-roadmap", title: "The 2025 web development roadmap for beginners", date: "Apr 20, 2025", category: "Technology", readTime: "10 min", excerpt: "HTML to full-stack in 6 months — a realistic, opinionated roadmap for getting your first developer job.", author: "Riya Kapoor" },
];

const catColors: Record<string, string> = {
  Programming: "rgba(91,124,250,0.1)",
  Mathematics: "rgba(139,111,247,0.1)",
  "AI & ML": "rgba(52,211,153,0.1)",
  Science: "rgba(251,191,36,0.1)",
  Technology: "rgba(249,115,22,0.1)",
};
const catText: Record<string, string> = {
  Programming: "#7c9dfc", Mathematics: "#a78bfa", "AI & ML": "#34d399", Science: "#fbbf24", Technology: "#fb923c",
};

export default function BlogPage() {
  return (
    <div>
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>Resources</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Articles & guides</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>
            Free resources written by our instructors to help you get started and go deeper.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 24 }}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 100, background: catColors[p.category], color: catText[p.category], fontWeight: 500 }}>{p.category}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.readTime} read</span>
                </div>
                <h2 style={{ fontSize: 18, marginBottom: 10, lineHeight: 1.4, fontFamily: "var(--font-dm-serif)" }}>{p.title}</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>{p.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>by {p.author}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
