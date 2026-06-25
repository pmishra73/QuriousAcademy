import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--background)", fontFamily: "system-ui, sans-serif", padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          fontSize: 80, fontWeight: 800, letterSpacing: "-0.04em",
          background: "linear-gradient(135deg, #5b7cfa, #8b6ff7)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1, marginBottom: 8,
        }}>
          404
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "var(--foreground)" }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 36 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            background: "var(--primary)", color: "white", textDecoration: "none",
            padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          }}>
            Go home
          </Link>
          <Link href="/courses" style={{
            background: "var(--surface-2)", color: "var(--text-dim)", textDecoration: "none",
            padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "1px solid var(--border)",
          }}>
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
