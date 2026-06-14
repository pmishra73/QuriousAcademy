import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px 24px 32px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #5b7cfa 0%, #8b6ff7 100%)",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "var(--font-dm-serif)",
                }}
              >
                Q
              </div>
              <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, letterSpacing: "-0.03em" }}>
                Qurious Academy
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 220 }}>
              Where curiosity meets clarity. Learn programming, maths, science, AI and technology from experts.
            </p>
          </div>

          {/* Learn */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
              Learn
            </p>
            {[
              { href: "/courses", label: "All Courses" },
              { href: "/courses?cat=programming", label: "Programming" },
              { href: "/courses?cat=maths", label: "Mathematics" },
              { href: "/courses?cat=ai", label: "AI & ML" },
              { href: "/courses?cat=science", label: "Science" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 10, transition: "color 0.15s" }}
                className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
              Company
            </p>
            {[
              { href: "/about", label: "About Us" },
              { href: "/teach", label: "Teach on Qurious Academy" },
              { href: "/blog", label: "Resources" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}
                className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
              Support
            </p>
            {[
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Help Center" },
              { href: "/faq#refund", label: "Refund Policy" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}
                className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Qurious Academy. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Built with intention ✦ India
          </p>
        </div>
      </div>
    </footer>
  );
}
