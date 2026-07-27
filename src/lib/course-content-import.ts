import type { CourseContent, Part, Chapter, Lesson, ContentBlock, TextFormat } from "@/lib/course-content";

// ─── Import schema ───────────────────────────────────────────────────────────
// A simplified, hand-writable shape for bulk-importing course content as JSON.
// Unlike the stored CourseContent, ids and order are generated automatically —
// authors only need to write titles and content.

const TEXT_FORMATS: TextFormat[] = ["normal", "bold", "italic", "heading", "subheading"];
const RESOURCE_BLOCK_TYPES = ["video", "live_recording", "image", "link", "document"] as const;

export type ImportBlock =
  | { type: "text"; format?: TextFormat; content: string }
  | { type: (typeof RESOURCE_BLOCK_TYPES)[number]; resourceId: string; caption?: string }
  | { type: "blog"; blobSlug: string; caption?: string };

export type ImportLesson = { title: string; blocks?: ImportBlock[] };
export type ImportChapter = { title: string; lessons?: ImportLesson[] };
export type ImportPart = { title: string; chapters?: ImportChapter[] };
export type ImportCourseContent = { parts: ImportPart[] };

export const EXAMPLE_JSON: ImportCourseContent = {
  parts: [
    {
      title: "Part 1: Getting Started",
      chapters: [
        {
          title: "Chapter 1: Introduction",
          lessons: [
            {
              title: "Lesson 1: Welcome",
              blocks: [
                { type: "text", format: "heading", content: "Welcome to the course" },
                { type: "text", format: "normal", content: "This is a normal paragraph of text." },
                { type: "video", resourceId: "paste-a-resource-id-here", caption: "Optional caption" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Validation ──────────────────────────────────────────────────────────────

type ValidationResult =
  | { ok: true; data: ImportCourseContent }
  | { ok: false; errors: string[] };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateBlock(raw: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(raw)) { errors.push(`${path}: must be an object`); return; }
  const type = raw.type;
  if (typeof type !== "string") { errors.push(`${path}.type: required string`); return; }

  if (type === "text") {
    if (raw.format !== undefined && !TEXT_FORMATS.includes(raw.format as TextFormat)) {
      errors.push(`${path}.format: must be one of ${TEXT_FORMATS.join(", ")}`);
    }
    if (typeof raw.content !== "string" || !raw.content.trim()) {
      errors.push(`${path}.content: required non-empty string`);
    }
  } else if ((RESOURCE_BLOCK_TYPES as readonly string[]).includes(type)) {
    if (typeof raw.resourceId !== "string" || !raw.resourceId.trim()) {
      errors.push(`${path}.resourceId: required non-empty string`);
    }
    if (raw.caption !== undefined && typeof raw.caption !== "string") {
      errors.push(`${path}.caption: must be a string`);
    }
  } else if (type === "blog") {
    if (typeof raw.blobSlug !== "string" || !raw.blobSlug.trim()) {
      errors.push(`${path}.blobSlug: required non-empty string`);
    }
    if (raw.caption !== undefined && typeof raw.caption !== "string") {
      errors.push(`${path}.caption: must be a string`);
    }
  } else {
    errors.push(`${path}.type: "${type}" is not a recognized block type (expected text, ${RESOURCE_BLOCK_TYPES.join(", ")}, or blog)`);
  }
}

function validateLesson(raw: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(raw)) { errors.push(`${path}: must be an object`); return; }
  if (typeof raw.title !== "string" || !raw.title.trim()) errors.push(`${path}.title: required non-empty string`);
  if (raw.blocks !== undefined) {
    if (!Array.isArray(raw.blocks)) { errors.push(`${path}.blocks: must be an array`); return; }
    raw.blocks.forEach((b, i) => validateBlock(b, `${path}.blocks[${i}]`, errors));
  }
}

function validateChapter(raw: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(raw)) { errors.push(`${path}: must be an object`); return; }
  if (typeof raw.title !== "string" || !raw.title.trim()) errors.push(`${path}.title: required non-empty string`);
  if (raw.lessons !== undefined) {
    if (!Array.isArray(raw.lessons)) { errors.push(`${path}.lessons: must be an array`); return; }
    raw.lessons.forEach((l, i) => validateLesson(l, `${path}.lessons[${i}]`, errors));
  }
}

function validatePart(raw: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(raw)) { errors.push(`${path}: must be an object`); return; }
  if (typeof raw.title !== "string" || !raw.title.trim()) errors.push(`${path}.title: required non-empty string`);
  if (raw.chapters !== undefined) {
    if (!Array.isArray(raw.chapters)) { errors.push(`${path}.chapters: must be an array`); return; }
    raw.chapters.forEach((c, i) => validateChapter(c, `${path}.chapters[${i}]`, errors));
  }
}

/** Parses and validates a JSON string against the import schema. Does not touch resource references. */
export function parseImportJson(raw: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ok: false, errors: [`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`] };
  }

  const errors: string[] = [];
  if (!isPlainObject(parsed)) {
    return { ok: false, errors: ["Root value must be an object with a \"parts\" array"] };
  }
  if (!Array.isArray(parsed.parts)) {
    return { ok: false, errors: ["\"parts\" is required and must be an array"] };
  }
  parsed.parts.forEach((p, i) => validatePart(p, `parts[${i}]`, errors));

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: parsed as unknown as ImportCourseContent };
}

/** Returns resourceIds referenced by the import that aren't in the given set — a non-blocking warning. */
export function findUnknownResourceIds(data: ImportCourseContent, knownResourceIds: Set<string>): string[] {
  const unknown = new Set<string>();
  for (const part of data.parts) {
    for (const chapter of part.chapters ?? []) {
      for (const lesson of chapter.lessons ?? []) {
        for (const block of lesson.blocks ?? []) {
          if (block.type !== "text" && block.type !== "blog" && !knownResourceIds.has(block.resourceId)) {
            unknown.add(block.resourceId);
          }
        }
      }
    }
  }
  return Array.from(unknown);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Converts validated import data into full CourseContent, generating ids and order. */
export function toCourseContent(data: ImportCourseContent, courseId: string): CourseContent {
  const parts: Part[] = data.parts.map((p, pi) => ({
    id: uid(),
    title: p.title,
    order: pi,
    chapters: (p.chapters ?? []).map((c, ci): Chapter => ({
      id: uid(),
      title: c.title,
      order: ci,
      lessons: (c.lessons ?? []).map((l, li): Lesson => ({
        id: uid(),
        title: l.title,
        order: li,
        blocks: (l.blocks ?? []).map((b): ContentBlock => {
          if (b.type === "text") return { id: uid(), type: "text", format: b.format ?? "normal", content: b.content };
          if (b.type === "blog") return { id: uid(), type: "blog", blobSlug: b.blobSlug, caption: b.caption };
          return { id: uid(), type: b.type, resourceId: b.resourceId, caption: b.caption };
        }),
      })),
    })),
  }));
  return { courseId, updatedAt: new Date().toISOString(), parts };
}

/** Converts full CourseContent back into the simplified import shape, for exporting. */
export function fromCourseContent(content: CourseContent): ImportCourseContent {
  return {
    parts: content.parts.map((p) => ({
      title: p.title,
      chapters: p.chapters.map((c) => ({
        title: c.title,
        lessons: c.lessons.map((l) => ({
          title: l.title,
          blocks: l.blocks.map((b): ImportBlock => {
            if (b.type === "text") return { type: "text", format: b.format, content: b.content };
            if (b.type === "blog") return { type: "blog", blobSlug: b.blobSlug, caption: b.caption };
            return { type: b.type, resourceId: b.resourceId, caption: b.caption };
          }),
        })),
      })),
    })),
  };
}
