"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = { id: string; title: string; category: string; author: string; published: boolean; hidden?: boolean; createdAt: string };
type Video = { id: string; title: string; courseId: string; published: boolean; hidden?: boolean; createdAt: string; teacher: { name: string } };
type CR = {
  id: string; contentType: string; contentTitle: string;
  requestorName: string; requestorEmail: string; suggestion: string;
  status: string; adminNote: string | null; ownerNote: string | null;
  rejectedBy: string | null; createdAt: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_admin:   { label: "Awaiting your review", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)" },
  pending_owner:   { label: "Sent to owner",         color: "#5b7cfa", bg: "rgba(91,124,250,0.08)", border: "rgba(91,124,250,0.25)" },
  owner_confirmed: { label: "Owner confirmed — final review", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
  approved:        { label: "Approved",               color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
  rejected:        { label: "Rejected",               color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, color: "var(--text-muted)", bg: "var(--surface-2)", border: "var(--border)" };
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function CRCard({ cr, onAction }: { cr: CR; onAction: () => void }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(action);
    await fetch(`/api/content-change-request/${cr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note.trim() || undefined }),
    });
    setLoading(null);
    onAction();
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", outline: "none", resize: "vertical" as const, fontFamily: "inherit", boxSizing: "border-box" as const };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{cr.contentType}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{cr.contentTitle}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>From: {cr.requestorName} · {cr.requestorEmail}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <StatusBadge status={cr.status} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(cr.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Suggestion</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{cr.suggestion}</p>
      </div>

      {cr.ownerNote && (
        <div style={{ fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
          Owner note: {cr.ownerNote}
        </div>
      )}

      {cr.status === "pending_admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the owner (optional)" rows={2} style={inputStyle} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => act("admin_approve")} disabled={!!loading} style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              {loading === "admin_approve" ? "Approving…" : "Approve & Send to Owner"}
            </button>
            <button onClick={() => act("admin_reject")} disabled={!!loading} style={{ flex: 1, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              {loading === "admin_reject" ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      )}

      {cr.status === "owner_confirmed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "10px 14px" }}>
            The owner has confirmed the change. Review and approve to publish and send the user their reward coupon.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => act("final_approve")} disabled={!!loading} style={{ flex: 1, background: "#34d399", color: "#0a0e1a", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              {loading === "final_approve" ? "Approving…" : "Final Approve & Send Coupon"}
            </button>
            <button onClick={() => act("final_reject")} disabled={!!loading} style={{ flex: 1, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              {loading === "final_reject" ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<"blogs" | "videos" | "requests">("blogs");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [requests, setRequests] = useState<CR[]>([]);

  async function loadBlogs() {
    const res = await fetch("/api/admin/blogs");
    setBlogs(await res.json());
  }
  async function loadVideos() {
    const res = await fetch("/api/teacher/videos");
    setVideos(await res.json());
  }
  async function loadRequests() {
    const res = await fetch("/api/content-change-request");
    setRequests(await res.json());
  }

  useEffect(() => { loadBlogs(); loadVideos(); loadRequests(); }, []);

  async function toggleBlogPublish(id: string, published: boolean) {
    await fetch(`/api/admin/blogs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    loadBlogs();
  }
  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    loadBlogs();
  }
  async function toggleVideoPublish(id: string, published: boolean) {
    await fetch(`/api/teacher/videos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    loadVideos();
  }
  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/teacher/videos/${id}`, { method: "DELETE" });
    loadVideos();
  }

  const pendingCount = requests.filter((r) => r.status === "pending_admin" || r.status === "owner_confirmed").length;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? "var(--primary)" : "var(--text-muted)",
    background: active ? "rgba(91,124,250,0.1)" : "transparent",
    border: active ? "1px solid rgba(91,124,250,0.25)" : "1px solid transparent",
    cursor: "pointer", fontFamily: "inherit", position: "relative" as const,
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Content</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>All teacher and institute content — visibility control and edit request workflow</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={tabStyle(tab === "blogs")} onClick={() => setTab("blogs")}>Blogs ({blogs.length})</button>
        <button style={tabStyle(tab === "videos")} onClick={() => setTab("videos")}>Videos ({videos.length})</button>
        <button style={{ ...tabStyle(tab === "requests"), display: "flex", alignItems: "center", gap: 8 }} onClick={() => setTab("requests")}>
          Edit Requests
          {pendingCount > 0 && (
            <span style={{ background: "#ef4444", color: "white", borderRadius: 100, fontSize: 10, fontWeight: 700, padding: "1px 7px", lineHeight: "16px" }}>{pendingCount}</span>
          )}
        </button>
      </div>

      {tab === "blogs" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {blogs.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No blog posts yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Title", "Category", "Author", "Visibility", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{b.title}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{b.category}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{b.author}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => toggleBlogPublish(b.id, b.published)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1px solid ${b.published ? "rgba(52,211,153,0.3)" : "var(--border)"}`, background: b.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: b.published ? "#34d399" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                        {b.published ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <Link href={`/admin/blogs/${b.id}`} style={{ fontSize: 12, color: "var(--primary)" }}>Edit</Link>
                        <button onClick={() => deleteBlog(b.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "videos" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {videos.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No videos yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  {["Title", "Course", "Teacher", "Visibility", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{v.title}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{v.courseId}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{v.teacher?.name}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => toggleVideoPublish(v.id, v.published)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1px solid ${v.published ? "rgba(52,211,153,0.3)" : "var(--border)"}`, background: v.published ? "rgba(52,211,153,0.1)" : "var(--surface-2)", color: v.published ? "#34d399" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                        {v.published ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{new Date(v.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button onClick={() => deleteVideo(v.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {requests.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
              No edit requests yet.
            </div>
          ) : (
            requests.map((r) => <CRCard key={r.id} cr={r} onAction={() => { loadRequests(); }} />)
          )}
        </div>
      )}
    </div>
  );
}
