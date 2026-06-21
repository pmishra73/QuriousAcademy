import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InstitutesAdminPage() {
  const institutes = await db.institute.findMany({
    orderBy: { createdAt: "desc" },
    include: { teachers: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Institutes</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{institutes.length} registered</p>
        </div>
        <Link href="/admin/institutes/new" style={{ background: "var(--primary)", color: "white", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          + Add Institute
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
        {institutes.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, gridColumn: "1/-1" }}>
            No institutes yet. Add one to get started.
          </div>
        )}
        {institutes.map((inst) => (
          <div key={inst.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
              {inst.logo ? (
                <img src={inst.logo} alt={inst.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", background: "var(--surface-2)", padding: 4 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  🏫
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{inst.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{inst.slug}.quriousacademy.com</div>
              </div>
            </div>
            {inst.bio && <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>{inst.bio.slice(0, 100)}{inst.bio.length > 100 ? "…" : ""}</p>}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: inst.active ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: inst.active ? "#34d399" : "#ef4444", border: `1px solid ${inst.active ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}` }}>
                {inst.active ? "Active" : "Inactive"}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{inst.teachers.length} teacher{inst.teachers.length !== 1 ? "s" : ""}</span>
              <Link href={`/admin/institutes/${inst.id}`} style={{ fontSize: 12, color: "var(--primary)", marginLeft: "auto" }}>Edit →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
