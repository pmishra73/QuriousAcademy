"use client";

import Link from "next/link";
import { useState } from "react";
import { PostMeta } from "@/lib/posts";

const catColors: Record<string, string> = {
  Programming: "rgba(91,124,250,0.1)",
  Mathematics: "rgba(139,111,247,0.1)",
  "AI & ML": "rgba(52,211,153,0.1)",
  Science: "rgba(251,191,36,0.1)",
  Technology: "rgba(249,115,22,0.1)",
};
const catText: Record<string, string> = {
  Programming: "#7c9dfc", Mathematics: "#a78bfa", "AI & ML": "#34d399", Science: "#fbbf24", Technology: "#fb923c",
};

export default function BlogList({ posts }: { posts: PostMeta[] }) {
  const allCategories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      <section style={{ padding: "64px 24px 48px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>Resources</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Articles & guides</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7 }}>
            Free resources written by our instructors to help you get started and go deeper.
          </p>
        </div>
      </section>

      {/* Sticky topic filter */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--background)", borderBottom: "1px solid var(--border)",
        padding: "12px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4, flexShrink: 0 }}>Topic</span>
          {allCategories.map((cat) => {
            const isActive = active === cat;
            const color = cat === "All" ? "var(--primary)" : (catText[cat] ?? "var(--primary)");
            const bg = cat === "All" ? "rgba(91,124,250,0.12)" : (catColors[cat] ?? "rgba(91,124,250,0.1)");
            return (
              <button key={cat} onClick={() => setActive(cat)} style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "1px solid", fontFamily: "inherit",
                borderColor: isActive ? color : "var(--border)",
                background: isActive ? bg : "var(--surface-2)",
                color: isActive ? color : "var(--text-dim)",
                transition: "all 0.15s",
              }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <section style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", paddingTop: 40 }}>No articles in this topic yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 24 }}>
              {filtered.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 100, background: catColors[p.category], color: catText[p.category], fontWeight: 500 }}>{p.category}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.readTime} read</span>
                  </div>
                  <h2 style={{ fontSize: 18, marginBottom: 10, lineHeight: 1.4, fontFamily: "var(--font-dm-serif), 'Source Serif 4', Georgia, serif" }}>{p.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>{p.excerpt}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>by {p.author}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(p.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
