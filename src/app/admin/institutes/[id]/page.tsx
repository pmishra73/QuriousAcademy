import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import InstituteEditClient from "./InstituteEditClient";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function InstituteEditPage({ params }: Props) {
  const { id } = await params;
  const institute = await db.institute.findUnique({
    where: { id },
    include: { teachers: { select: { id: true, name: true, slug: true } } },
  });
  if (!institute) notFound();

  const allTeachers = await db.user.findMany({
    where: { role: "teacher", active: true },
    select: { id: true, name: true, instituteId: true },
    orderBy: { name: "asc" },
  });

  return <InstituteEditClient institute={institute} allTeachers={allTeachers} />;
}
