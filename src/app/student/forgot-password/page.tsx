"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/student/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      setErr("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Qurious Academy
          </span>
        </Link>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 36 }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Check your email</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link href="/student/login" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Forgot password?</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
                Enter the email address you enrolled with and we'll send you a reset link.
              </p>

              {err && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
                >
                  {loading ? "Sending…" : "Send reset link →"}
                </button>
              </form>

              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20, textAlign: "center" }}>
                <Link href="/student/login" style={{ color: "var(--primary)", textDecoration: "none" }}>← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
