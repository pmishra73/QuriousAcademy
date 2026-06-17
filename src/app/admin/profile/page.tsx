import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AdminProfilePage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>My Profile</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Admin account settings</p>
      </div>

      {/* Account info */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Account</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Name", value: user?.name ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
            { label: "Role", value: "Admin" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", width: 80, paddingTop: 1, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 14 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Change password</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          Must be at least 8 characters.
        </p>
        <ChangePasswordForm accentColor="var(--primary)" />
      </div>
    </div>
  );
}
