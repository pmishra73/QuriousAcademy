"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/teacher", label: "My Courses", icon: "📚" },
  { href: "/teacher/sessions", label: "Sessions", icon: "📅" },
  { href: "/teacher/students", label: "Students", icon: "🎓" },
  { href: "/teacher/blogs", label: "Blogs", icon: "✍️" },
  { href: "/teacher/videos", label: "Videos", icon: "🎬" },
  { href: "/teacher/resources", label: "Resources", icon: "📎" },
  { href: "/teacher/announcements", label: "Announcements", icon: "📣" },
  { href: "/teacher/profile", label: "My Profile", icon: "⚙" },
];

function AdminBackLink({ collapsed, isAdmin }: { collapsed: boolean; isAdmin?: boolean }) {
  if (!isAdmin) return null;
  return (
    <Link href="/admin" title={collapsed ? "Back to Admin" : undefined} style={{
      display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      padding: collapsed ? "10px 0" : "9px 12px",
      borderRadius: 8, fontSize: collapsed ? 18 : 13,
      color: "#5b7cfa", background: "rgba(91,124,250,0.07)",
      border: "1px solid rgba(91,124,250,0.2)",
      textDecoration: "none", fontWeight: 500,
    }}>
      {collapsed ? "⚙" : <><span>⚙</span> Back to Admin</>}
    </Link>
  );
}

export default function TeacherNav({ onCollapse, isAdmin }: { onCollapse?: (c: boolean) => void; isAdmin?: boolean }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  }

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: collapsed ? 64 : 240,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", zIndex: 50,
      transition: "width 0.2s ease", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 8 }}>
        {!collapsed && (
          <div>
            <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", display: "block", whiteSpace: "nowrap", marginBottom: 4 }}>
              Qurious Academy
            </Link>
            <span style={{ fontSize: 10, color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(52,211,153,0.2)" }}>
              Teacher
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
          const active = item.href === "/teacher" ? path === "/teacher" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} style={{
              display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px 0" : "9px 12px",
              borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? "#34d399" : "var(--text-dim)",
              background: active ? "rgba(52,211,153,0.1)" : "transparent",
              textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden",
            }}>
              <span style={{ fontSize: collapsed ? 18 : 14, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
        <AdminBackLink collapsed={collapsed} isAdmin={isAdmin} />
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
