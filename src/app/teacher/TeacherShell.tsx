"use client";
import { useState } from "react";
import TeacherNav from "./TeacherNav";

export default function TeacherShell({ children, isAdmin }: { children: React.ReactNode; isAdmin?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <TeacherNav onCollapse={setCollapsed} isAdmin={isAdmin} />
      <main style={{ flex: 1, marginLeft: collapsed ? 64 : 240, padding: "32px 36px", minHeight: "100vh", transition: "margin-left 0.2s ease" }}>
        {children}
      </main>
    </div>
  );
}
