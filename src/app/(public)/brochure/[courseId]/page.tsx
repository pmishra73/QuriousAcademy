"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { variants } from "@/lib/variants";

const SESSION_KEY = "qa_contact";

type ContactInfo = { name: string; email: string; phone: string };
type Status = "idle" | "loading" | "success" | "error";

export default function BrochurePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const variant = variants.find((v) => v.id === courseId);
  const title = variant?.title ?? "Course Brochure";

  const [form, setForm] = useState<ContactInfo>({ name: "", email: "", phone: "" });
  const [prefilled, setPrefilled] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  // Pre-fill from sessionStorage if present
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed: ContactInfo = JSON.parse(saved);
        setForm(parsed);
        setPrefilled(true);
      }
    } catch {}
  }, []);

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

      // Persist contact info in sessionStorage for this browser session
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(form)); } catch {}

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
              {prefilled && (
                <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 text-xs text-indigo-300 leading-relaxed">
                  We remembered your details from this session. Just hit download.
                </div>
              )}

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
                    value={form[name as keyof ContactInfo]}
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
