"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, ContentBlock, CurriculumPart } from "@/lib/course-content";

type Resource = { id: string; type: string; title: string; url?: string; blobSlug?: string };

type Props = {
  courseId: string;
  courseTitle: string;
  curriculum: CurriculumPart[];
  activeLesson: Lesson | null;
  resourceMap: Record<string, Resource>;
  completedSet: string[];
  studentEmail: string | null;
  enrolled: boolean;
};

function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").pop()}`;
  } catch { /* ignore */ }
  return null;
}

function BlockRenderer({ block, resourceMap }: { block: ContentBlock; resourceMap: Record<string, Resource> }) {
  if (block.type === "text") {
    const tag = block.format === "heading" ? "h2" : block.format === "subheading" ? "h3" : "p";
    const style: React.CSSProperties = {
      fontSize: block.format === "heading" ? 22 : block.format === "subheading" ? 17 : 15,
      fontWeight: block.format === "heading" || block.format === "subheading" || block.format === "bold" ? 700 : 400,
      fontStyle: block.format === "italic" ? "italic" : "normal",
      lineHeight: 1.7, margin: "0 0 12px",
    };
    return <div style={style}>{block.content}</div>;
  }

  if (block.type === "video" || block.type === "live_recording") {
    const resource = resourceMap[block.resourceId];
    const url = resource?.url;
    const embed = url ? embedUrl(url) : null;
    return (
      <div style={{ marginBottom: 20 }}>
        {block.caption && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{block.caption}</div>}
        {embed ? (
          <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "#000" }}>
            <iframe src={embed} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen allow="autoplay; encrypted-media" />
          </div>
        ) : url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: "var(--primary)", fontSize: 14 }}>▶ {resource?.title ?? "Watch recording"} ↗</a>
        ) : <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Video not available</div>}
      </div>
    );
  }

  if (block.type === "image") {
    const resource = resourceMap[block.resourceId];
    return resource?.url ? (
      <div style={{ marginBottom: 20 }}>
        <img src={resource.url} alt={block.caption ?? resource.title} style={{ maxWidth: "100%", borderRadius: 8 }} />
        {block.caption && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{block.caption}</div>}
      </div>
    ) : null;
  }

  if (block.type === "link" || block.type === "document") {
    const resource = resourceMap[block.resourceId];
    return resource?.url ? (
      <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)", fontSize: 14, marginBottom: 12, textDecoration: "none", background: "rgba(91,124,250,0.08)", border: "1px solid rgba(91,124,250,0.2)", padding: "8px 14px", borderRadius: 8 }}>
        {block.type === "document" ? "📄" : "🔗"} {block.caption ?? resource.title} ↗
      </a>
    ) : null;
  }

  return null;
}

export default function LearnShell({ courseId, courseTitle, curriculum, activeLesson, resourceMap, completedSet, studentEmail, enrolled }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(new Set(completedSet));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const totalLessons = curriculum.reduce((acc, p) => acc + p.chapters.reduce((a, c) => a + c.lessons.length, 0), 0);
  const doneCount = completed.size;

  async function markComplete(lessonId: string) {
    const isDone = !completed.has(lessonId);
    setCompleted(s => { const n = new Set(s); isDone ? n.add(lessonId) : n.delete(lessonId); return n; });
    if (studentEmail) {
      await fetch(`/api/learn/${courseId}/progress`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmail, lessonId, completed: isDone }),
      });
    }
  }

  function goLesson(lessonId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("lessonId", lessonId);
    if (studentEmail) url.searchParams.set("email", studentEmail);
    router.push(url.pathname + url.search);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif", background: "var(--background)" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{courseTitle}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doneCount} / {totalLessons} lessons complete</div>
            <div style={{ marginTop: 8, height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#34d399", width: `${totalLessons > 0 ? (doneCount / totalLessons) * 100 : 0}%`, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          </div>
          <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
            {curriculum.map(part => (
              <div key={part.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", padding: "6px 8px" }}>{part.title}</div>
                {part.chapters.map(ch => (
                  <div key={ch.id} style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", padding: "4px 8px" }}>{ch.title}</div>
                    {ch.lessons.map(l => {
                      const isActive = l.id === activeLesson?.id;
                      const isDone = completed.has(l.id);
                      return (
                        <button key={l.id} onClick={() => goLesson(l.id)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 6px 16px", background: isActive ? "rgba(91,124,250,0.12)" : "none", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
                          <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${isDone ? "#34d399" : "var(--border)"}`, background: isDone ? "#34d399" : "none", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white" }}>
                            {isDone ? "✓" : ""}
                          </span>
                          <span style={{ fontSize: 12, color: isActive ? "var(--primary)" : "var(--text-dim)", lineHeight: 1.4 }}>{l.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 32px 80px" }}>
          {/* Toggle sidebar */}
          <button onClick={() => setSidebarOpen(s => !s)} style={{ marginBottom: 24, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "var(--text-muted)", fontFamily: "inherit" }}>
            {sidebarOpen ? "← Hide" : "☰ Contents"}
          </button>

          {!enrolled && studentEmail && (
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "#fbbf24" }}>
              You are not enrolled in this course. Enroll to track your progress.
            </div>
          )}

          {activeLesson ? (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, lineHeight: 1.3 }}>{activeLesson.title}</h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {activeLesson.blocks.map(block => (
                  <BlockRenderer key={block.id} block={block} resourceMap={resourceMap} />
                ))}
              </div>
              {studentEmail && (
                <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => markComplete(activeLesson.id)}
                    style={{ background: completed.has(activeLesson.id) ? "rgba(52,211,153,0.1)" : "#34d399", color: completed.has(activeLesson.id) ? "#34d399" : "#0a0e1a", border: completed.has(activeLesson.id) ? "1px solid rgba(52,211,153,0.3)" : "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {completed.has(activeLesson.id) ? "✓ Marked Complete" : "Mark as Complete"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Welcome to {courseTitle}</div>
              <div style={{ fontSize: 14 }}>Select a lesson from the sidebar to begin.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
