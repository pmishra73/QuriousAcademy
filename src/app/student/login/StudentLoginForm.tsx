"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const oauthError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(
    oauthError === "invalid_state" ? "That sign-in link expired — please try again."
    : oauthError === "oauth_failed" ? "Couldn't sign you in with that provider — please try again."
    : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Invalid email or password."); return; }
    router.push("/dashboard");
    router.refresh();
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
          <PasswordInput
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
    </>
  );
}

export default function StudentLoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
