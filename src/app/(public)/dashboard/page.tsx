import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student-session";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import { courses } from "@/lib/courses";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const student = await getStudentSession();
  if (!student) redirect("/student/login");

  const enrollments = await db.enrollment.findMany({
    where: { status: "confirmed", OR: [{ studentId: student.id }, { studentEmail: student.email }] },
    orderBy: { createdAt: "desc" },
  });

  const enrolled = enrollments.map((e) => {
    const variant = variants.find((v) => v.id === e.courseId);
    const course = courses.find((c) => c.id === e.courseId);
    return { id: e.courseId, title: variant?.title ?? course?.title ?? e.courseId };
  });

  return (
    <div style={{ padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="tag" style={{ display: "inline-flex", marginBottom: 16 }}>Dashboard</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginBottom: 8 }}>Welcome back{student.name ? `, ${student.name}` : ""}</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 15 }}>Your enrolled courses.</p>
          </div>
          <LogoutButton />
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px", marginBottom: 48, maxWidth: 240 }}>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 28, marginBottom: 4, color: "var(--primary)" }}>{enrolled.length}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Courses enrolled</div>
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Your courses</h2>
        {enrolled.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, marginBottom: 48, color: "var(--text-muted)", fontSize: 14 }}>
            You don&apos;t have any enrolled courses yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
            {enrolled.map((c) => (
              <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 17 }}>{c.title}</h3>
                <Link href={`/learn/${c.id}`} style={{ background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: 7, fontWeight: 500, fontSize: 13, display: "inline-block" }}>
                  Continue Learning →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
            <h2 style={{ fontSize: 18 }}>Explore more courses</h2>
            <Link href="/courses" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>View all →</Link>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Continue building your skills. We have courses in Mathematics, AI & ML, Science, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
