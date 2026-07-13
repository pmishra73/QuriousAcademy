"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildPostText } from "@/lib/linkedin-post-text";

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};

type Post = {
  slug: string; title: string; excerpt: string; body: string; category: string; published: boolean;
  linkedinRequested?: boolean; linkedinApprovalStatus?: "none" | "pending" | "approved" | "rejected";
  linkedinStatus?: "idle" | "posted" | "failed"; linkedinPostUrl?: string;
};

export default function AdminEditBlogPage({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId: slugParam } = use(params);
  const isNew = slugParam === "new";
  const router = useRouter();
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", body: "", category: "General", published: false });
  const [linkedin, setLinkedin] = useState<Pick<Post, "linkedinRequested" | "linkedinApprovalStatus" | "linkedinStatus" | "linkedinPostUrl">>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/teacher/blogs-blob/${slugParam}`).then(r => r.json()).then((p: Post) => {
        setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, category: p.category, published: p.published });
        setLinkedin({ linkedinRequested: p.linkedinRequested, linkedinApprovalStatus: p.linkedinApprovalStatus, linkedinStatus: p.linkedinStatus, linkedinPostUrl: p.linkedinPostUrl });
      });
    }
    fetch("/api/admin/linkedin/settings").then(r => r.json()).then(d => setLinkedinConnected(!!d.connected)).catch(() => {});
  }, [slugParam, isNew]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true); setError("");
    const res = isNew
      ? await fetch("/api/teacher/blogs-blob", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch(`/api/teacher/blogs-blob/${slugParam}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    router.push("/admin/blogs");
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/teacher/blogs-blob/${slugParam}`, { method: "DELETE" });
    router.push("/admin/blogs");
  }

  async function setLinkedInApproval(status: "approved" | "rejected") {
    setLinkedin(l => ({ ...l, linkedinApprovalStatus: status }));
    await fetch(`/api/teacher/blogs-blob/${slugParam}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedinApprovalStatus: status }),
    });
  }

  async function postToLinkedIn() {
    setPosting(true);
    const res = await fetch("/api/admin/linkedin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugParam }),
    });
    const data = await res.json();
    setPosting(false);
    if (!res.ok) { alert(data.error ?? "Failed to post to LinkedIn."); return; }
    setLinkedin(l => ({ ...l, linkedinStatus: "posted", linkedinPostUrl: data.postUrl }));
  }

  async function copyPostText() {
    await navigator.clipboard.writeText(buildPostText(form.title, form.excerpt, form.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function markPosted() {
    setLinkedin(l => ({ ...l, linkedinStatus: "posted" }));
    await fetch(`/api/teacher/blogs-blob/${slugParam}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedinStatus: "posted" }),
    });
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/blogs" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Blogs</Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{isNew ? "New Post" : "Edit Post"}</h1>
      </div>

      {!isNew && linkedin.linkedinRequested && (
        <div style={{ background: "rgba(10,102,194,0.06)", border: "1px solid rgba(10,102,194,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, flex: 1 }}>
            The author requested this post be posted to LinkedIn.{" "}
            {linkedin.linkedinApprovalStatus === "approved" && linkedin.linkedinStatus === "posted" && <strong style={{ color: "#34d399" }}>Posted.</strong>}
            {linkedin.linkedinApprovalStatus === "approved" && linkedin.linkedinStatus !== "posted" && <strong style={{ color: "#34d399" }}>Approved — post it whenever you&apos;re ready.</strong>}
            {linkedin.linkedinApprovalStatus === "rejected" && <strong style={{ color: "#ef4444" }}>Rejected.</strong>}
            {linkedin.linkedinApprovalStatus === "pending" && <strong style={{ color: "#fbbf24" }}>Awaiting your review.</strong>}
            {linkedin.linkedinPostUrl && (
              <> · <a href={linkedin.linkedinPostUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>View live post ↗</a></>
            )}
          </span>
          {linkedin.linkedinApprovalStatus === "pending" && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" onClick={() => setLinkedInApproval("approved")} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.1)", color: "#34d399", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Approve</button>
              <button type="button" onClick={() => setLinkedInApproval("rejected")} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Reject</button>
            </div>
          )}
          {linkedin.linkedinApprovalStatus === "approved" && linkedin.linkedinStatus !== "posted" && linkedinConnected && (
            <button type="button" onClick={postToLinkedIn} disabled={posting} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #0a66c2", background: "#0a66c2", color: "white", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, flexShrink: 0 }}>
              {posting ? "Posting…" : "Post to LinkedIn"}
            </button>
          )}
          {linkedin.linkedinApprovalStatus === "approved" && linkedin.linkedinStatus !== "posted" && !linkedinConnected && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" onClick={copyPostText} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #0a66c2", background: copied ? "#34d399" : "#0a66c2", color: "white", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }} title="Copy the post text, then paste it into a new post on your LinkedIn Company Page">
                {copied ? "Copied ✓" : "Copy post text"}
              </button>
              <button type="button" onClick={markPosted} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }} title="Once you've pasted it on LinkedIn yourself">
                Mark as posted
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={lbl}>Title *</label>
            <input style={inp} value={form.title} onChange={set("title")} required />
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
              {["General", "Data Science", "Finance", "Career", "Technology", "Interview Prep"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
              Published
            </label>
          </div>
        </div>
        <div>
          <label style={lbl}>Excerpt</label>
          <input style={inp} value={form.excerpt} onChange={set("excerpt")} placeholder="Short description shown in listings" />
        </div>
        <div>
          <label style={lbl}>Body *</label>
          <textarea style={{ ...inp, minHeight: 300, resize: "vertical", lineHeight: 1.6 }} value={form.body} onChange={set("body")} required />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="submit" disabled={saving} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : isNew ? "Publish Post" : "Save Changes"}
          </button>
          <Link href="/admin/blogs" style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
            Cancel
          </Link>
          {!isNew && (
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginLeft: "auto", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              {deleting ? "Deleting…" : "Delete Post"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
