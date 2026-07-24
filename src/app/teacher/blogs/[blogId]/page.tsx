"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseVideo } from "@/lib/video-embed";

function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

const CATEGORIES = ["General", "Programming", "Mathematics", "AI & ML", "Science", "Technology", "Data Structures", "Interview Prep", "Career"];

type Form = { slug: string; title: string; excerpt: string; body: string; category: string; videoUrl: string; imageUrl: string; published: boolean; linkedinRequested: boolean };

export default function TeacherEditBlogPage({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = use(params);
  const isNew = blogId === "new";
  const router = useRouter();
  const [form, setForm] = useState<Form>({ slug: "", title: "", excerpt: "", body: "", category: "General", videoUrl: "", imageUrl: "", published: false, linkedinRequested: false });
  const [linkedinApprovalStatus, setLinkedinApprovalStatus] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const previewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/teacher/blogs-blob/${blogId}`).then(r => r.json()).then((p: Form & { linkedinApprovalStatus?: string }) => {
        setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", body: p.body, category: p.category, videoUrl: p.videoUrl ?? "", imageUrl: p.imageUrl ?? "", published: p.published, linkedinRequested: p.linkedinRequested ?? false });
        setLinkedinApprovalStatus(p.linkedinApprovalStatus);
      });
    }
  }, [blogId, isNew]);

  // Live preview — debounced 600ms after typing stops
  useEffect(() => {
    if (!form.body) { setPreviewHtml(""); return; }
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(async () => {
      setPreviewLoading(true);
      const res = await fetch("/api/teacher/blogs-blob/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: form.body }),
      });
      const { html } = await res.json();
      setPreviewHtml(html);
      setPreviewLoading(false);
    }, 600);
    return () => { if (previewDebounce.current) clearTimeout(previewDebounce.current); };
  }, [form.body]);

  function handleTitle(v: string) {
    const slug = isNew ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug;
    setForm(f => ({ ...f, title: v, slug: isNew ? slug : f.slug }));
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const compressed = await compressImage(file, 1200, 0.85);
    const fd = new FormData();
    fd.append("file", compressed, file.name);
    fd.append("slug", form.slug || "blog");
    const res = await fetch("/api/teacher/blogs-blob/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    setImageUploading(false);
    if (res.ok) setForm(f => ({ ...f, imageUrl: data.url }));
    else setError(data.error ?? "Image upload failed");
    e.target.value = "";
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true); setError("");
    const payload = { ...form, videoUrl: form.videoUrl.trim() || undefined, imageUrl: form.imageUrl.trim() || undefined };
    const res = isNew
      ? await fetch("/api/teacher/blogs-blob", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/teacher/blogs-blob/${blogId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/teacher/blogs");
  }

  return (
    <div style={{ maxWidth: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/teacher/blogs" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Blogs</Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        {previewLoading && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Updating preview…</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Editor */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} value={form.title} onChange={e => handleTitle(e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>Slug *</label>
              <input style={inp} value={form.slug} onChange={set("slug")} placeholder="url-friendly-slug" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Category</label>
              <select style={inp} value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                Publish immediately
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={form.linkedinRequested} onChange={e => setForm(f => ({ ...f, linkedinRequested: e.target.checked }))} />
              Request LinkedIn post after publishing
            </label>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              An admin reviews and approves before it goes out on the company LinkedIn page.
              {linkedinApprovalStatus === "pending" && <span style={{ color: "#fbbf24" }}> · Awaiting admin approval.</span>}
              {linkedinApprovalStatus === "approved" && <span style={{ color: "#34d399" }}> · Approved — queued to post.</span>}
              {linkedinApprovalStatus === "rejected" && <span style={{ color: "#ef4444" }}> · Rejected by admin.</span>}
            </div>
          </div>

          <div>
            <label style={lbl}>Excerpt</label>
            <input style={inp} value={form.excerpt} onChange={set("excerpt")} placeholder="Short description shown in blog listings" />
          </div>

          {/* Cover image */}
          <div>
            <label style={lbl}>Cover Image</label>
            {form.imageUrl && (
              <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
                <img src={form.imageUrl} alt="Cover" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 12, cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 13, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", color: "var(--text-dim)" }}>
                {imageUploading ? "Uploading…" : "Choose image"}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>JPEG, PNG or WebP · max 5 MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} style={{ display: "none" }} disabled={imageUploading} />
            </label>
          </div>

          <div>
            <label style={lbl}>Video URL (optional — YouTube or Vimeo)</label>
            <input style={inp} type="url" value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://youtube.com/watch?v=..." />
            {(() => {
              const video = form.videoUrl.trim() ? parseVideo(form.videoUrl.trim()) : null;
              if (!form.videoUrl.trim()) return <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Embedded above the article body on the public page.</div>;
              if (!video) return <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 4 }}>Doesn&apos;t look like a YouTube or Vimeo URL.</div>;
              if (video.type === "youtube") return <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt="Video thumbnail" style={{ marginTop: 8, width: 160, borderRadius: 6, border: "1px solid var(--border)" }} />;
              return <div style={{ fontSize: 11, color: "#34d399", marginTop: 4 }}>Valid Vimeo link ✓</div>;
            })()}
          </div>

          <div>
            <label style={lbl}>Body * (Markdown)</label>
            <textarea
              style={{ ...inp, minHeight: 340, resize: "vertical", lineHeight: 1.7, fontFamily: "monospace", fontSize: 13 }}
              value={form.body} onChange={set("body")} required
              placeholder={"# Section heading\n\nYour content here. Supports **bold**, *italic*, `code`, lists, and more.\n\n## Another section\n\nKeep writing..."}
            />
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Saving…" : isNew ? "Publish Post" : "Save Changes"}
            </button>
            <Link href="/teacher/blogs" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>

        {/* Live preview */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Live Preview {previewLoading && "· updating…"}
          </div>
          <div
            className="prose"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 28px", minHeight: 200, maxHeight: "80vh", overflowY: "auto" }}
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p style='color:var(--text-muted);font-size:14px'>Start typing to see a live preview…</p>" }}
          />
        </div>
      </div>
    </div>
  );
}
