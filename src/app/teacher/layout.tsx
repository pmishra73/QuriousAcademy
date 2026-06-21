import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherShell from "./TeacherShell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "teacher" && role !== "admin")) redirect("/login?from=teacher");
  return <TeacherShell isAdmin={role === "admin"}>{children}</TeacherShell>;
}
