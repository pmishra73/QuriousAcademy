"use client";
import { useState } from "react";

export default function GenerateCouponButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/coupons/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, reason: "promotional" }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.code) setResult(data.code);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
      >
        + Generate Coupon
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Generate Promotional Coupon</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--foreground)", boxSizing: "border-box", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel"
                  style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--foreground)", boxSizing: "border-box", outline: "none" }} />
              </div>
              {result && (
                <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Coupon generated</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: "#34d399", letterSpacing: 2 }}>{result}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => { setOpen(false); setResult(null); setEmail(""); setPhone(""); }}
                style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)", fontFamily: "inherit" }}>
                Close
              </button>
              <button onClick={generate} disabled={loading || !email}
                style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: loading || !email ? "not-allowed" : "pointer", opacity: loading || !email ? 0.6 : 1, fontFamily: "inherit" }}>
                {loading ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
