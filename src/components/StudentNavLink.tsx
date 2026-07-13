"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentNavLink() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/student/me").then(r => r.json()).then(d => setLoggedIn(!!d.loggedIn)).catch(() => setLoggedIn(false));
  }, []);

  if (loggedIn === null) return null;

  return (
    <Link
      href={loggedIn ? "/dashboard" : "/student/login"}
      style={{
        fontSize: 13,
        color: "var(--text-dim)",
        padding: "9px 18px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "transparent",
        fontWeight: 500,
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {loggedIn ? "My Dashboard" : "Student Login"}
    </Link>
  );
}
