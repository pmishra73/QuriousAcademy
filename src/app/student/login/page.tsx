import Link from "next/link";
import StudentLoginForm from "./StudentLoginForm";

const OAUTH_BUTTONS = [
  { key: "google", label: "Continue with Google", envVar: "GOOGLE_CLIENT_ID" },
  { key: "github", label: "Continue with GitHub", envVar: "GITHUB_CLIENT_ID" },
  { key: "linkedin", label: "Continue with LinkedIn", envVar: "LINKEDIN_CLIENT_ID" },
] as const;

export default function StudentLoginPage() {
  const availableProviders = OAUTH_BUTTONS.filter((p) => !!process.env[p.envVar]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Qurious Academy
          </span>
        </Link>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Student sign in</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            Access your enrolled courses
          </p>

          {availableProviders.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {availableProviders.map((p) => (
                <a
                  key={p.key}
                  href={`/api/student/auth/${p.key}/start`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "11px 16px", fontSize: 13, fontWeight: 500, color: "var(--foreground)", textDecoration: "none",
                  }}
                >
                  {p.label}
                </a>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
            </div>
          )}

          <StudentLoginForm />

          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20, textAlign: "center" }}>
            Bought a course but never set a password? Check your enrollment confirmation email for a link to set one.
          </p>
        </div>
      </div>
    </div>
  );
}
