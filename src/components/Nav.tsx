"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/about", label: "About", icon: "✦" },
  { href: "/blog", label: "Blogs", icon: "📖" },
  { href: "/contact", label: "Contact", icon: "✉" },
  { href: "/faq", label: "FAQ", icon: "💬" },
];

const partnerLinks = [
  { href: "/corporate", label: "For Corporates", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  { href: "/institutes", label: "For Institutes", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(8,12,24,0.92)",
        backdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #5b7cfa 0%, #8b6ff7 100%)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
              fontFamily: "var(--font-dm-serif)",
            }}
          >
            Q
          </div>
          <span
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: 18,
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
            }}
          >
            Qurious Academy
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="hidden md:flex">
          {links.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "7px 13px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--foreground)" : "var(--text-dim)",
                  background: active ? "var(--surface-2)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {l.label}
              </Link>
            );
          })}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px", flexShrink: 0 }} />
          {partnerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "5px 12px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                color: l.color,
                background: path === l.href ? l.bg : "transparent",
                border: `1px solid ${path === l.href ? l.border : "transparent"}`,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = l.bg;
                (e.currentTarget as HTMLElement).style.borderColor = l.border;
              }}
              onMouseLeave={(e) => {
                if (path !== l.href) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <Link
            href="/courses"
            style={{
              fontSize: 13,
              color: "white",
              padding: "10px 22px",
              borderRadius: 8,
              background: "var(--primary)",
              fontWeight: 700,
              fontSize: 15,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 12px rgba(91,124,250,0.35)",
            }}
            className="hidden md:block"
          >
            Explore Courses →
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{
              background: open ? "var(--surface-2)" : "none",
              border: open ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--foreground)",
              padding: "6px 8px",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {open ? (
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "8px 16px 20px",
          }}
          className="md:hidden"
        >
          {/* Nav links as pill grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, paddingTop: 8 }}>
            {links.map((l) => {
              const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--foreground)" : "var(--text-dim)",
                    background: active ? "var(--surface-2)" : "transparent",
                    border: `1px solid ${active ? "var(--border)" : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Main CTA */}
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              style={{
                display: "block", textAlign: "center",
                padding: "12px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                color: "white", background: "var(--primary)",
              }}
            >
              Explore Courses →
            </Link>

            {/* Partner links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {partnerLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "10px", borderRadius: 10,
                    fontSize: 12, fontWeight: 600, color: l.color,
                    background: l.bg, border: `1px solid ${l.border}`,
                  }}>
                  {l.label}
                </Link>
              ))}
            </div>

            <Link
              href="/teach"
              onClick={() => setOpen(false)}
              style={{
                display: "block", textAlign: "center",
                padding: "10px", borderRadius: 10,
                fontSize: 13, color: "var(--text-dim)",
                border: "1px solid var(--border)",
              }}
            >
              Teach on Qurious Academy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
