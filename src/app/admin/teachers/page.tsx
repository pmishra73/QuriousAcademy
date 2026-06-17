import { db } from "@/lib/db";
import Link from "next/link";

export default async function TeachersPage() {
  const teachers = await db.user.findMany({ where: { role: "teacher" }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Teachers</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{teachers.length} accounts</p>
        </div>
        <Link href="/admin/teachers/new" style={{ background: "var(--primary)", color: "white", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          + Add Teacher
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
        {teachers.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, gridColumn: "1/-1" }}>
            No teacher accounts yet. Add one to get started.
          </div>
        )}
        {teachers.map((t) => (
          <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              {t.photo ? (
                <img src={t.photo} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {t.name[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.email}</div>
              </div>
            </div>
            {t.bio && <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 14 }}>{t.bio}</p>}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: t.active ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: t.active ? "#34d399" : "#ef4444", border: `1px solid ${t.active ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}` }}>
                {t.active ? "Active" : "Inactive"}
              </span>
              <Link href={`/admin/teachers/${t.id}`} style={{ fontSize: 12, color: "var(--primary)", marginLeft: "auto" }}>Edit →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
