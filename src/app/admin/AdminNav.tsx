"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▪" },
  { href: "/admin/enrollments", label: "Enrollments", icon: "🎓" },
  { href: "/admin/leads", label: "Leads & Coupons", icon: "🎁" },
  { href: "/admin/courses", label: "Courses", icon: "📚" },
  { href: "/admin/teachers", label: "Teachers", icon: "👤" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
  { href: "/admin/content", label: "Content", icon: "✍️" },
  { href: "/admin/profile", label: "My Profile", icon: "⚙" },
];

export default function AdminNav({ onCollapse }: { onCollapse?: (c: boolean) => void }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  }

  const W = collapsed ? 64 : 240;

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: W,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", zIndex: 50,
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 8 }}>
        {!collapsed && (
          <div>
            <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", display: "block", whiteSpace: "nowrap", marginBottom: 4 }}>
              Qurious Academy
            </Link>
            <span style={{ fontSize: 10, color: "#5b7cfa", background: "rgba(91,124,250,0.12)", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(91,124,250,0.2)" }}>
              Admin
            </span>
          </div>
        )}
        <button onClick={toggle} style={{
          background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6,
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text-muted)", fontSize: 12, flexShrink: 0,
        }}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map((item) => {
          const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} style={{
              display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px 0" : "9px 12px",
              borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? "var(--primary)" : "var(--text-dim)",
              background: active ? "rgba(91,124,250,0.1)" : "transparent",
              textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden",
            }}>
              <span style={{ fontSize: collapsed ? 18 : 14, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
        {!collapsed && (
          <Link href="/teacher" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, color: "var(--text-dim)", marginBottom: 2 }}>
            <span>📋</span> Teacher View
          </Link>
        )}
        <button onClick={() => signOut({ callbackUrl: "/" })} title={collapsed ? "Sign out" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px 0" : "9px 12px",
            borderRadius: 8, fontSize: collapsed ? 18 : 13, color: "var(--text-muted)",
            background: "none", border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
          }}>
          {collapsed ? "↩" : <><span>↩</span> Sign out</>}
        </button>
      </div>
    </aside>
  );
}
