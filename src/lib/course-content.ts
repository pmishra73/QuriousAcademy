import { put, list, del } from "@vercel/blob";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TextFormat = "normal" | "bold" | "italic" | "heading" | "subheading";

export type ContentBlock =
  | { id: string; type: "text"; format: TextFormat; content: string }
  | { id: string; type: "video" | "live_recording" | "image" | "link" | "document"; resourceId: string; caption?: string }
  | { id: string; type: "blog"; blobSlug: string; caption?: string };

export type Lesson = {
  id: string;
  title: string;
  order: number;
  blocks: ContentBlock[];
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export type Part = {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
};

export type CourseContent = {
  courseId: string;
  updatedAt: string;
  parts: Part[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PREFIX = "course-content/";

function blobOpts() {
  return { storeId: process.env.BLOB_STORE_ID };
}

export async function saveCourseContent(content: CourseContent): Promise<string> {
  content.updatedAt = new Date().toISOString();
  const { url } = await put(
    `${PREFIX}${content.courseId}.json`,
    JSON.stringify(content),
    { access: "public", contentType: "application/json", addRandomSuffix: false, ...blobOpts() }
  );
  return url;
}

export async function getCourseContent(courseId: string): Promise<CourseContent | null> {
  const { blobs } = await list({ prefix: `${PREFIX}${courseId}.json`, ...blobOpts() });
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].url, { next: { revalidate: 30 } });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteCourseContent(courseId: string): Promise<void> {
  const { blobs } = await list({ prefix: `${PREFIX}${courseId}.json`, ...blobOpts() });
  for (const b of blobs) await del(b.url, blobOpts());
}

export function emptyCourseContent(courseId: string): CourseContent {
  return { courseId, updatedAt: new Date().toISOString(), parts: [] };
}

// ─── Curriculum extraction ────────────────────────────────────────────────────
// Extracts the flat curriculum (Parts → Chapters → Lessons) for display,
// without the full block content.

export type CurriculumLesson  = { id: string; title: string; order: number; blockCount: number };
export type CurriculumChapter = { id: string; title: string; order: number; lessons: CurriculumLesson[] };
export type CurriculumPart    = { id: string; title: string; order: number; chapters: CurriculumChapter[] };

export function extractCurriculum(content: CourseContent): CurriculumPart[] {
  return content.parts.map((p) => ({
    id: p.id, title: p.title, order: p.order,
    chapters: p.chapters.map((c) => ({
      id: c.id, title: c.title, order: c.order,
      lessons: c.lessons.map((l) => ({
        id: l.id, title: l.title, order: l.order, blockCount: l.blocks.length,
      })),
    })),
  }));
}
