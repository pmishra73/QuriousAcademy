"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setLoading(true);
    const res = await fetch("/api/student/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Something went wrong."); return; }
    router.push("/dashboard");
    router.refresh();
  }

  if (!token) {
    return <p style={{ color: "#ef4444", fontSize: 13 }}>This link is missing its token — check the email again for the full link.</p>;
  }

  return (
    <>
      {err && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
          {err}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>New password</label>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Confirm password</label>
          <PasswordInput
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
        >
          {loading ? "Saving…" : "Set password & continue →"}
        </button>
      </form>
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Qurious Academy
          </span>
        </Link>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Set your password</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            One more step to access your dashboard
          </p>
          <Suspense>
            <SetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
