"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Resources" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
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
        background: "rgba(8,12,24,0.8)",
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
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              fontSize: 20,
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
            }}
          >
            Qurious Academy
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 400,
                color: path === l.href ? "var(--foreground)" : "var(--text-dim)",
                background: path === l.href ? "var(--surface-2)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }} />
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
              className="partner-nav-link"
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
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/teach"
            style={{
              fontSize: 13,
              color: "var(--text-dim)",
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            className="hidden md:block hover:text-white"
          >
            Teach on Qurious Academy
          </Link>
          <Link
            href="/courses"
            style={{
              fontSize: 13,
              color: "white",
              padding: "8px 18px",
              borderRadius: 7,
              background: "var(--primary)",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
          >
            Explore Courses
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              padding: 6,
            }}
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
            padding: "12px 24px 16px",
          }}
          className="md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 0",
                fontSize: 15,
                color: path === l.href ? "var(--foreground)" : "var(--text-dim)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/teach"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "10px 0", fontSize: 15, color: "var(--text-dim)", borderBottom: "1px solid var(--border)" }}
          >
            Teach on Qurious Academy
          </Link>
          {partnerLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 0", fontSize: 15, fontWeight: 600, color: l.color }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
