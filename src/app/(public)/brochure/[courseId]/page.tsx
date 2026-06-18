"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Map courseId → human-readable title (for display before the API responds)
const COURSE_TITLES: Record<string, string> = {
  "python-masterclass": "Python in 3 Hours",
  "python-cohort": "Python Weekend Intensive",
  "python-deep-dive": "Python Mastery — 90 Days",
  "python-standard": "Python for Data Science — 8 Weeks",
  "ai-masterclass": "AI Demystified in 3 Hours",
  "ai-cohort": "Build with AI — Weekend Cohort",
  "ai-deep-dive": "AI & ML Engineering — 12 Weeks",
  "calculus-masterclass": "Calculus in 3 Hours",
  "linear-algebra-masterclass": "Linear Algebra for ML in 3 Hours",
  "maths-cohort": "Maths for ML — Power Weekend",
  "webdev-sprint": "Build Your First Website — 3 Weeks",
  "react-sprint": "React Foundations — 4 Weeks",
  "physics-cohort": "Classical Mechanics Weekend",
  "dsa-standard": "DSA for Interviews — 6 Weeks",
};

type Status = "idle" | "loading" | "success" | "error";

export default function BrochurePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const title = COURSE_TITLES[courseId] ?? "Course Brochure";

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch(`/api/brochure/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const { url } = await res.json();

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${courseId}-brochure.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-4">
            <span className="w-8 h-px bg-indigo-400 opacity-60" />
            Course Brochure
            <span className="w-8 h-px bg-indigo-400 opacity-60" />
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug mb-2">{title}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Enter your details to download the full brochure — curriculum, outcomes,
            schedule, and pricing — as a PDF.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-lg font-semibold text-white mb-2">Download started</h2>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Your brochure is downloading. We&apos;ve also sent a copy to{" "}
                <span className="text-white font-medium">{form.email}</span>.
              </p>
              <Link
                href={`/enroll?course=${courseId}`}
                className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-semibold text-sm px-6 py-3"
              >
                Enroll in this course →
              </Link>
              <div className="mt-4">
                <Link href="/courses" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                  Browse all courses
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Full Name", type: "text", placeholder: "Ananya Sharma" },
                { name: "email", label: "Email Address", type: "email", placeholder: "ananya@example.com" },
                { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
                  />
                </div>
              ))}

              {status === "error" && (
                <p className="text-red-400 text-sm">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm py-3"
              >
                {status === "loading" ? "Preparing download…" : "Download Brochure (PDF)"}
              </button>

              <p className="text-xs text-neutral-600 text-center leading-relaxed">
                We&apos;ll also email you a copy. No spam — just the brochure
                and a heads-up when enrollment opens.
              </p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/courses" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
            ← Back to all courses
          </Link>
        </div>
      </div>
    </main>
  );
}
