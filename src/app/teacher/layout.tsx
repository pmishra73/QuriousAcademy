import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherNav from "./TeacherNav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "teacher" && role !== "admin")) redirect("/login?from=teacher");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <TeacherNav />
      <main style={{ flex: 1, marginLeft: 240, padding: "32px 36px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
