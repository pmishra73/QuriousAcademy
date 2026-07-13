import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import TeacherEditClient from "./TeacherEditClient";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function TeacherEditPage({ params }: Props) {
  const { id } = await params;
  const teacher = await db.user.findUnique({ where: { id, role: "teacher" } });
  if (!teacher) notFound();
  const { password: _password, ...safeTeacher } = teacher;

  const institutes = await db.institute.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <TeacherEditClient teacher={safeTeacher} institutes={institutes} />;
}
