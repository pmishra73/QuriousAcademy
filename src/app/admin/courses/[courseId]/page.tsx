"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type MergedVariant = {
  id: string;
  title: string;
  tagline: string;
  price: number;
  recordedPrice?: number;
  level: string;
  duration: string;
  deliveryMode: string;
  type: string;
  subjectLabel: string;
  hidden: boolean;
  effectiveScheduleDates: string[];
  content: {
    overview: string;
    sessions: { session: string; title: string; topics: string[] }[];
    prerequisites: string;
    outcomes: string[];
    includes: string[];
    certificate: string;
  };
};

const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--foreground)", borderRadius: 8, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit",
};
const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", display: "block",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
};
const section: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 12, padding: 24, marginBottom: 24,
};

export default function CourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [variant, setVariant] = useState<MergedVariant | null>(null);
  const [form, setForm] = useState<Partial<MergedVariant>>({});
  const [datesInput, setDatesInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}`)
      .then((r) => r.json())
      .then((data: MergedVariant) => {
        setVariant(data);
        setForm({
          title: data.title,
          tagline: data.tagline,
          price: data.price,
          recordedPrice: data.recordedPrice,
          level: data.level,
          hidden: data.hidden,
        });
        setDatesInput(data.effectiveScheduleDates.join("\n"));
        setLoading(false);
      });
  }, [courseId]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const scheduleDates = datesInput.split("\n").map((s) => s.trim()).filter(Boolean);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduleDates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div style={{ color: "var(--text-muted)", padding: 40 }}>Loading…</div>;
  if (!variant) return <div style={{ color: "var(--text-muted)", padding: 40 }}>Course not found.</div>;

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/courses" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
          ← Courses
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{variant.title}</h1>
        <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 4 }}>{variant.id}</span>
      </div>

      <form onSubmit={handleSave}>
        {/* Visibility */}
        <div style={section}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Visibility</h2>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.hidden ?? false}
              onChange={set("hidden")}
              style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Hide this course</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Hidden courses are not shown on the public catalog or enrollment page.</div>
            </div>
          </label>
        </div>

        {/* Core details */}
        <div style={section}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Course Details</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={lbl}>Title</label>
              <input style={inp} value={form.title ?? ""} onChange={set("title")} placeholder="Course title" />
            </div>
            <div>
              <label style={lbl}>Tagline</label>
              <input style={inp} value={form.tagline ?? ""} onChange={set("tagline")} placeholder="Short tagline" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={lbl}>Live Price (₹)</label>
                <input style={inp} type="number" value={form.price ?? ""} onChange={set("price")} />
              </div>
              <div>
                <label style={lbl}>Recorded Price (₹) <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
                <input style={inp} type="number" value={form.recordedPrice ?? ""} onChange={set("recordedPrice")} />
              </div>
            </div>
            <div>
              <label style={lbl}>Level</label>
              <select style={{ ...inp, background: "var(--surface-2)" }} value={form.level ?? ""} onChange={set("level")}>
                {["Beginner", "Intermediate", "Advanced", "Beginner to Intermediate", "Intermediate to Advanced"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule dates */}
        <div style={section}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Batch Dates</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.6 }}>
            One date per line. These override the auto-computed schedule. Leave blank to use the computed schedule.
            <br />Format: <code style={{ fontFamily: "monospace", fontSize: 11 }}>Saturday, 5 July 2025 · 10:00 AM IST</code>
          </p>
          <textarea
            style={{ ...inp, minHeight: 140, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            value={datesInput}
            onChange={(e) => setDatesInput(e.target.value)}
            placeholder={"Saturday, 5 July 2025 · 10:00 AM IST\nSaturday, 2 August 2025 · 10:00 AM IST"}
          />
        </div>

        {/* Read-only info */}
        <div style={section}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Read-only (from courses.json)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Type", variant.type],
              ["Duration", variant.duration],
              ["Delivery Mode", variant.deliveryMode],
              ["Subject", variant.subjectLabel],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ ...lbl, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
            Content (curriculum, sessions, outcomes) is edited by running the course content script. See <code>scripts/generate-brochure.ts</code>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "var(--primary)", color: "white", border: "none", borderRadius: 8,
              padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span style={{ fontSize: 13, color: "#34d399" }}>Saved!</span>}
          <Link href={`/courses/${courseId}`} target="_blank" style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>
            Preview on site →
          </Link>
        </div>
      </form>
    </div>
  );
}
