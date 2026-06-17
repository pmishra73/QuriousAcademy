import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/login?from=admin");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <AdminNav />
      <main style={{ flex: 1, marginLeft: 240, padding: "32px 36px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
