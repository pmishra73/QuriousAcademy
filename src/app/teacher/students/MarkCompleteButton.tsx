"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkCompleteButton({
  enrollmentId, studentName, studentEmail, studentPhone, courseId,
}: { enrollmentId: string; studentName: string; studentEmail: string; studentPhone: string; courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function mark() {
    if (!confirm(`Mark ${studentName} as completed? This will generate and send them a 10% off coupon.`)) return;
    setLoading(true);
    await fetch("/api/teacher/students/mark-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, studentEmail, studentPhone, studentName, courseId }),
    });
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  if (done) return <span style={{ fontSize: 12, color: "#34d399" }}>✓ Done</span>;

  return (
    <button onClick={mark} disabled={loading} style={{
      fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.25)", borderRadius: 6, padding: "5px 12px",
      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit",
    }}>
      {loading ? "Sending…" : "Mark complete"}
    </button>
  );
}
