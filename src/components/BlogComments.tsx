"use client";
import { useState, useEffect } from "react";

type Comment = { id: string; name: string; body: string; createdAt: string };

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

export default function BlogComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/blog-comments/${slug}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setComments(d));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess(false);
    const res = await fetch(`/api/blog-comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error ?? "Failed to post comment"); return; }
    setComments(c => [...c, data]);
    setName(""); setBody(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        Comments {comments.length > 0 && <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}>({comments.length})</span>}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--primary),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-dim)", margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>No comments yet. Be the first to share your thoughts.</p>
      )}

      {/* Comment form */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Leave a comment</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            style={inp}
            placeholder="Your name *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={80}
          />
          <textarea
            style={{ ...inp, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
            placeholder="Write your comment…"
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            maxLength={2000}
          />
          {error && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: "#34d399", margin: 0 }}>Comment posted!</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{ alignSelf: "flex-start", background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
