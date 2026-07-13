import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseContent, extractCurriculum } from "@/lib/course-content";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import { getStudentSession } from "@/lib/student-session";
import LearnShell from "./LearnShell";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params, searchParams }: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ email?: string; lessonId?: string }>;
}) {
  const { courseId } = await params;
  const { email: legacyEmail, lessonId } = await searchParams;

  const variant = variants.find(v => v.id === courseId);
  if (!variant) notFound();

  const student = await getStudentSession();

  // Legacy links (?email=...) from pre-account emails no longer grant silent
  // access — prompt the student to log in instead.
  if (!student && legacyEmail) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16, color: "var(--text-muted)", fontFamily: "system-ui,sans-serif", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)" }}>Please log in to continue</div>
        <div style={{ fontSize: 14, maxWidth: 420 }}>Log in as <strong>{legacyEmail}</strong> to access your course.</div>
        <Link href={`/student/login`} style={{ background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: 7, fontWeight: 500, fontSize: 13, textDecoration: "none" }}>
          Log in →
        </Link>
      </div>
    );
  }

  const email = student?.email ?? null;

  // Verify enrollment
  let enrolled = false;
  if (email) {
    const enrollment = await db.enrollment.findFirst({
      where: { courseId, status: "confirmed", OR: [{ studentId: student?.id }, { studentEmail: email }] },
    });
    enrolled = !!enrollment;
  }

  const approval = await db.courseApproval.findUnique({ where: { courseId } });
  const content = await getCourseContent(courseId);

  if (!content || !approval || approval.status !== "approved") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, color: "var(--text-muted)", fontFamily: "system-ui,sans-serif" }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)" }}>Content coming soon</div>
        <div style={{ fontSize: 14 }}>The course content for <strong>{variant.title}</strong> is being prepared.</div>
      </div>
    );
  }

  const curriculum = extractCurriculum(content);

  // Fetch resources referenced in this course
  const resourceIds = content.parts.flatMap(p => p.chapters.flatMap(c => c.lessons.flatMap(l =>
    l.blocks.filter(b => "resourceId" in b).map(b => (b as { resourceId: string }).resourceId)
  )));
  const resources = resourceIds.length > 0
    ? await db.resource.findMany({ where: { id: { in: resourceIds } }, select: { id: true, type: true, title: true, url: true, blobSlug: true } })
    : [];
  const resourceMap = Object.fromEntries(resources.map(r => [r.id, { ...r, url: r.url ?? undefined, blobSlug: r.blobSlug ?? undefined }]));

  // Fetch progress
  const progress = email
    ? await db.lessonProgress.findMany({ where: { studentEmail: email, courseId } })
    : [];
  const completedSet = new Set(progress.filter(p => p.completed).map(p => p.lessonId));

  // Find initial lesson
  const firstLesson = content.parts[0]?.chapters[0]?.lessons[0];
  const activeLessonId = lessonId ?? firstLesson?.id ?? null;

  let activeLesson = null;
  for (const part of content.parts) {
    for (const ch of part.chapters) {
      const found = ch.lessons.find(l => l.id === activeLessonId);
      if (found) { activeLesson = found; break; }
    }
  }

  return (
    <LearnShell
      courseId={courseId}
      courseTitle={variant.title}
      curriculum={curriculum}
      activeLesson={activeLesson}
      resourceMap={resourceMap}
      completedSet={Array.from(completedSet)}
      studentEmail={email ?? null}
      enrolled={enrolled}
    />
  );
}
