import { notFound } from "next/navigation";
import { getCourseContent, extractCurriculum } from "@/lib/course-content";
import { db } from "@/lib/db";
import { variants } from "@/lib/variants";
import LearnShell from "./LearnShell";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params, searchParams }: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ email?: string; lessonId?: string }>;
}) {
  const { courseId } = await params;
  const { email, lessonId } = await searchParams;

  const variant = variants.find(v => v.id === courseId);
  if (!variant) notFound();

  // Verify enrollment if email provided
  let enrolled = false;
  if (email) {
    const enrollment = await db.enrollment.findFirst({ where: { courseId, studentEmail: email, status: "confirmed" } });
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
