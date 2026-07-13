"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/student/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}
    >
      Sign out
    </button>
  );
}
