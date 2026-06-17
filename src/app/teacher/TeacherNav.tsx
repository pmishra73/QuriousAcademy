"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/teacher", label: "My Courses", icon: "📚" },
  { href: "/teacher/sessions", label: "Sessions", icon: "📅" },
  { href: "/teacher/students", label: "Students", icon: "🎓" },
  { href: "/teacher/resources", label: "Resources", icon: "📎" },
  { href: "/teacher/announcements", label: "Announcements", icon: "📣" },
  { href: "/teacher/profile", label: "My Profile", icon: "👤" },
];

export default function TeacherNav() {
  const path = usePathname();

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", zIndex: 50,
    }}>
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", display: "block", marginBottom: 4 }}>
          Qurious Academy
        </Link>
        <span style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(52,211,153,0.12)", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(52,211,153,0.2)" }}>
          Teacher
        </span>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = item.href === "/teacher" ? path === "/teacher" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? "#34d399" : "var(--text-dim)",
              background: active ? "rgba(52,211,153,0.1)" : "transparent",
              textDecoration: "none",
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  );
}
