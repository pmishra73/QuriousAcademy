import { getAllPostsMeta } from "@/lib/posts";
import Link from "next/link";

export default function AdminContentPage() {
  const posts = getAllPostsMeta();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Content</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{posts.length} articles published</p>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
        Articles are currently managed as markdown files in <code style={{ fontFamily: "monospace", background: "var(--surface)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>src/content/posts/</code>.
        A UI editor is on the roadmap. For now, edit the .md files directly and push to deploy.
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              {["Title", "Category", "Author", "Read time", "Date", ""].map((h) => (
                <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: "12px 20px" }}>
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{p.category}</span>
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{p.author}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{p.readTime}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>{p.date}</td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/blog/${p.slug}`} target="_blank" style={{ fontSize: 12, color: "var(--primary)" }}>View ↗</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
