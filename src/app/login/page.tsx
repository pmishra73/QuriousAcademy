"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const error = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(error === "unauthorized" ? "You don't have access to that area." : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setErr("Invalid email or password.");
    } else {
      router.push(from === "teacher" ? "/teacher" : "/admin");
    }
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
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sign in</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            Admin and teacher access only
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
                style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
