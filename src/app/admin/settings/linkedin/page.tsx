"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

type Settings = { connected: boolean; organizationUrn: string | null };

function LinkedInSettingsInner() {
  const params = useSearchParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orgUrn, setOrgUrn] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/linkedin/settings").then(r => r.json()).then((d: Settings) => {
      setSettings(d);
      setOrgUrn(d.organizationUrn ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/linkedin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationUrn: orgUrn }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function disconnect() {
    if (!confirm("Disconnect LinkedIn? You won't be able to post approved posts until reconnected.")) return;
    await fetch("/api/admin/linkedin/settings", { method: "DELETE" });
    setSettings(s => s ? { ...s, connected: false } : s);
  }

  const error = params.get("error");
  const justConnected = params.get("connected") === "1";

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>LinkedIn Integration</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Blog posts a teacher marks &ldquo;Request LinkedIn post&rdquo; show up in the blog list for you
        to approve. Once approved, post it to your connected LinkedIn company page whenever you&apos;re
        ready — nothing posts automatically.
      </p>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
          {error === "invalid_state" ? "LinkedIn sign-in expired — try connecting again." : "Couldn't connect to LinkedIn. Try again."}
        </div>
      )}
      {justConnected && (
        <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#34d399", marginBottom: 20 }}>
          LinkedIn connected. Set your Organization URN below to finish setup.
        </div>
      )}

      {!settings ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600,
              background: settings.connected ? "rgba(52,211,153,0.1)" : "var(--surface-2)",
              color: settings.connected ? "#34d399" : "var(--text-muted)",
              border: `1px solid ${settings.connected ? "rgba(52,211,153,0.25)" : "var(--border)"}`,
            }}>
              {settings.connected ? "Connected" : "Not connected"}
            </span>
          </div>

          {!settings.connected ? (
            <a href="/api/admin/linkedin/oauth/start" style={{ alignSelf: "flex-start", background: "#0a66c2", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Connect LinkedIn →
            </a>
          ) : (
            <button type="button" onClick={disconnect} style={{ alignSelf: "flex-start", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Disconnect
            </button>
          )}

          <div>
            <label style={lbl}>Organization URN</label>
            <input style={inp} value={orgUrn} onChange={e => setOrgUrn(e.target.value)} placeholder="urn:li:organization:12345678" />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Found under your LinkedIn Page admin tools, or via the Organizations API.
            </div>
          </div>

          <button type="button" onClick={save} disabled={saving} style={{ alignSelf: "flex-start", background: saved ? "#34d399" : "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function LinkedInSettingsPage() {
  return (
    <Suspense>
      <LinkedInSettingsInner />
    </Suspense>
  );
}
