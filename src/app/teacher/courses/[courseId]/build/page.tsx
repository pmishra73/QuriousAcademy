"use client";
import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CourseContent, Part, Chapter, Lesson, ContentBlock, TextFormat } from "@/lib/course-content";

// ─── Tiny ID generator ───────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── Styles ──────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const btn = (color = "var(--primary)", text = "white"): React.CSSProperties => ({ background: color, color: text, border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" });

type Resource = { id: string; type: string; tag?: string; title: string; url?: string; blobSlug?: string };

export default function CourseBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  const [content, setContent] = useState<CourseContent>({ courseId, updatedAt: "", parts: [] });
  const [selected, setSelected] = useState<{ partId: string; chapterId: string; lessonId: string } | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>("draft");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/teacher/courses/${courseId}/content`).then(r => r.json()).then(setContent);
    fetch("/api/teacher/resources").then(r => r.json()).then(d => setResources(Array.isArray(d) ? d.filter((r: Resource) => r.type !== "blog") : []));
    fetch("/api/admin/courses/approvals").then(r => r.json()).then(list => {
      if (Array.isArray(list)) {
        const a = list.find((x: { courseId: string }) => x.courseId === courseId);
        if (a) setApprovalStatus(a.status);
      }
    }).catch(() => {});
  }, [courseId]);

  // ─── Tree mutations ───────────────────────────────────────────────────────

  function addPart() {
    const p: Part = { id: uid(), title: "New Part", order: content.parts.length, chapters: [] };
    setContent(c => ({ ...c, parts: [...c.parts, p] }));
  }

  function addChapter(partId: string) {
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: [...p.chapters, { id: uid(), title: "New Chapter", order: p.chapters.length, lessons: [] }] }) }));
  }

  function addLesson(partId: string, chapterId: string) {
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: p.chapters.map(ch => ch.id !== chapterId ? ch : { ...ch, lessons: [...ch.lessons, { id: uid(), title: "New Lesson", order: ch.lessons.length, blocks: [] }] }) }) }));
  }

  function updatePartTitle(partId: string, title: string) {
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id === partId ? { ...p, title } : p) }));
  }
  function updateChapterTitle(partId: string, chapterId: string, title: string) {
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: p.chapters.map(ch => ch.id === chapterId ? { ...ch, title } : ch) }) }));
  }
  function updateLessonTitle(partId: string, chapterId: string, lessonId: string, title: string) {
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: p.chapters.map(ch => ch.id !== chapterId ? ch : { ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? { ...l, title } : l) }) }) }));
  }

  function deletePart(partId: string) { setContent(c => ({ ...c, parts: c.parts.filter(p => p.id !== partId) })); }
  function deleteChapter(partId: string, chId: string) { setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: p.chapters.filter(ch => ch.id !== chId) }) })); }
  function deleteLesson(partId: string, chId: string, lId: string) { setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== partId ? p : { ...p, chapters: p.chapters.map(ch => ch.id !== chId ? ch : { ...ch, lessons: ch.lessons.filter(l => l.id !== lId) }) }) })); }

  // ─── Lesson content mutations ─────────────────────────────────────────────

  const selectedLesson = useCallback((): Lesson | null => {
    if (!selected) return null;
    const p = content.parts.find(p => p.id === selected.partId);
    const ch = p?.chapters.find(c => c.id === selected.chapterId);
    return ch?.lessons.find(l => l.id === selected.lessonId) ?? null;
  }, [content, selected]);

  function updateBlocks(blocks: ContentBlock[]) {
    if (!selected) return;
    setContent(c => ({ ...c, parts: c.parts.map(p => p.id !== selected.partId ? p : { ...p, chapters: p.chapters.map(ch => ch.id !== selected.chapterId ? ch : { ...ch, lessons: ch.lessons.map(l => l.id !== selected.lessonId ? l : { ...l, blocks }) }) }) }));
  }

  function addTextBlock() {
    const lesson = selectedLesson();
    if (!lesson) return;
    const block: ContentBlock = { id: uid(), type: "text", format: "normal", content: "" };
    updateBlocks([...lesson.blocks, block]);
  }

  function addResourceBlock(resource: Resource) {
    const lesson = selectedLesson();
    if (!lesson) return;
    const block: ContentBlock = { id: uid(), type: resource.type as ContentBlock["type"], resourceId: resource.id };
    updateBlocks([...lesson.blocks, block]);
  }

  function updateBlock(blockId: string, patch: Partial<ContentBlock>) {
    const lesson = selectedLesson();
    if (!lesson) return;
    updateBlocks(lesson.blocks.map(b => b.id === blockId ? { ...b, ...patch } as ContentBlock : b));
  }

  function deleteBlock(blockId: string) {
    const lesson = selectedLesson();
    if (!lesson) return;
    updateBlocks(lesson.blocks.filter(b => b.id !== blockId));
  }

  function moveBlock(blockId: string, dir: -1 | 1) {
    const lesson = selectedLesson();
    if (!lesson) return;
    const idx = lesson.blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= lesson.blocks.length) return;
    const blocks = [...lesson.blocks];
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    updateBlocks(blocks);
  }

  // ─── Save / Submit ────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    await fetch(`/api/teacher/courses/${courseId}/content`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function submitForReview() {
    await save();
    setSubmitting(true);
    await fetch(`/api/teacher/courses/${courseId}/submit`, { method: "POST" });
    setSubmitting(false);
    setApprovalStatus("pending");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const lesson = selectedLesson();

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", gap: 0 }}>
      {/* LEFT: Tree */}
      <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Course</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{courseId}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn(saved ? "#34d399" : "var(--primary)")} onClick={save} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
            </button>
            {approvalStatus === "draft" || approvalStatus === "rejected" ? (
              <button style={btn("#fbbf24", "#0a0e1a")} onClick={submitForReview} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            ) : (
              <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 100, background: approvalStatus === "approved" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)", color: approvalStatus === "approved" ? "#34d399" : "#fbbf24", border: `1px solid ${approvalStatus === "approved" ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}` }}>
                {approvalStatus}
              </span>
            )}
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {content.parts.map(part => (
            <div key={part.id} style={{ marginBottom: 4 }}>
              {/* Part */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>▸</span>
                <input value={part.title} onChange={e => updatePartTitle(part.id, e.target.value)}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12, fontWeight: 700, color: "var(--foreground)", fontFamily: "inherit", padding: "2px 4px" }} />
                <button onClick={() => addChapter(part.id)} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "var(--primary)", padding: "2px 4px" }} title="Add Chapter">+Ch</button>
                <button onClick={() => deletePart(part.id)} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>✕</button>
              </div>

              {/* Chapters */}
              {part.chapters.map(ch => (
                <div key={ch.id} style={{ marginLeft: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0" }}>
                    <span style={{ fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>▸</span>
                    <input value={ch.title} onChange={e => updateChapterTitle(part.id, ch.id, e.target.value)}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", fontFamily: "inherit", padding: "2px 4px" }} />
                    <button onClick={() => addLesson(part.id, ch.id)} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "var(--primary)", padding: "2px 4px" }} title="Add Lesson">+L</button>
                    <button onClick={() => deleteChapter(part.id, ch.id)} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>✕</button>
                  </div>

                  {/* Lessons */}
                  {ch.lessons.map(l => {
                    const isActive = selected?.lessonId === l.id;
                    return (
                      <div key={l.id} style={{ marginLeft: 14, display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
                        <button onClick={() => setSelected({ partId: part.id, chapterId: ch.id, lessonId: l.id })}
                          style={{ flex: 1, textAlign: "left", background: isActive ? "rgba(91,124,250,0.12)" : "none", border: "none", borderRadius: 4, padding: "3px 6px", fontSize: 12, color: isActive ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.title}
                        </button>
                        <button onClick={() => {
                          const newTitle = prompt("Rename lesson:", l.title);
                          if (newTitle) updateLessonTitle(part.id, ch.id, l.id, newTitle);
                        }} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}>✎</button>
                        <button onClick={() => deleteLesson(part.id, ch.id, l.id)} style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
          <button onClick={addPart} style={{ width: "100%", marginTop: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: 6, padding: "8px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
            + Add Part
          </button>
        </div>
      </div>

      {/* RIGHT: Lesson Editor */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {!lesson ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 14, flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 40 }}>📖</div>
            <div>Select a lesson from the left to start editing its content.</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <input value={lesson.title} onChange={e => updateLessonTitle(selected!.partId, selected!.chapterId, selected!.lessonId, e.target.value)}
                style={{ fontSize: 22, fontWeight: 700, background: "none", border: "none", outline: "none", color: "var(--foreground)", fontFamily: "inherit", width: "100%" }}
                placeholder="Lesson title" />
            </div>

            {/* Content blocks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {lesson.blocks.map((block, idx) => (
                <div key={block.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, position: "relative" }}>
                  {/* Block controls */}
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                    <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} style={{ ...btn("var(--surface-2)", "var(--text-muted)"), fontSize: 10, padding: "2px 6px" }}>↑</button>
                    <button onClick={() => moveBlock(block.id, 1)} disabled={idx === lesson.blocks.length - 1} style={{ ...btn("var(--surface-2)", "var(--text-muted)"), fontSize: 10, padding: "2px 6px" }}>↓</button>
                    <button onClick={() => deleteBlock(block.id)} style={{ ...btn("rgba(239,68,68,0.1)", "#ef4444"), fontSize: 10, padding: "2px 6px" }}>✕</button>
                  </div>

                  {block.type === "text" && (
                    <div>
                      <select value={block.format} onChange={e => updateBlock(block.id, { format: e.target.value as TextFormat })}
                        style={{ ...inp, width: "auto", marginBottom: 8, fontSize: 11 }}>
                        {(["heading", "subheading", "normal", "bold", "italic"] as TextFormat[]).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })}
                        rows={block.format === "heading" || block.format === "subheading" ? 1 : 4}
                        style={{ ...inp, resize: "vertical" as const, lineHeight: 1.6,
                          fontSize: block.format === "heading" ? 20 : block.format === "subheading" ? 16 : 14,
                          fontWeight: block.format === "heading" || block.format === "bold" ? 700 : 400,
                          fontStyle: block.format === "italic" ? "italic" : "normal",
                        }}
                        placeholder={`${block.format} text…`} />
                    </div>
                  )}

                  {(block.type === "video" || block.type === "live_recording" || block.type === "image" || block.type === "link" || block.type === "document") && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {block.type.replace("_", " ")} resource
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                        {resources.find(r => r.id === block.resourceId)?.title ?? `Resource ID: ${block.resourceId}`}
                      </div>
                      <input value={block.caption ?? ""} onChange={e => updateBlock(block.id, { caption: e.target.value })}
                        style={{ ...inp, marginTop: 8, fontSize: 12 }} placeholder="Caption (optional)" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add block buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <button onClick={addTextBlock} style={btn("var(--surface-2)", "var(--text-dim)")}>+ Text Block</button>
              <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>Add resource:</span>
              {resources.slice(0, 8).map(r => (
                <button key={r.id} onClick={() => addResourceBlock(r)}
                  style={{ ...btn("var(--surface-2)", "var(--text-muted)"), fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={r.title}>
                  {r.type === "video" ? "🎬" : r.type === "live_recording" ? "📹" : r.type === "image" ? "🖼️" : "🔗"} {r.title}
                </button>
              ))}
              {resources.length > 8 && <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>+{resources.length - 8} more in library</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
