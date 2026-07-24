"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Enrollment = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  courseId: string;
  amountPaid: number;
  discountApplied: number;
  couponCode: string | null;
  status: string;
  createdAt: string;
};

const statusColor: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: "rgba(52,211,153,0.1)", color: "#34d399", border: "rgba(52,211,153,0.25)" },
  pending:   { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  refunded:  { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

export default function EnrollmentRow({ e }: { e: Enrollment }) {
  const router = useRouter();
  const [status, setStatus] = useState(e.status);
  const [saving, setSaving] = useState(false);

  const s = statusColor[status] ?? statusColor.pending;

  async function changeStatus(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    const res = await fetch(`/api/admin/enrollments/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); router.refresh(); }
    setSaving(false);
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>{e.studentName}</td>
      <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentEmail}</td>
      <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)" }}>{e.studentPhone}</td>
      <td style={{ padding: "12px 20px", fontSize: 12 }}>{e.courseId}</td>
      <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500 }}>
        ₹{(e.amountPaid / 100).toLocaleString("en-IN")}
        {e.discountApplied > 0 && <span style={{ fontSize: 11, color: "#34d399", marginLeft: 6 }}>-{e.discountApplied}%</span>}
      </td>
      <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{e.couponCode ?? "—"}</td>
      <td style={{ padding: "12px 20px" }}>
        <select
          value={status}
          disabled={saving}
          onChange={ev => changeStatus(ev.target.value)}
          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: s.bg, color: s.color, border: `1px solid ${s.border}`, outline: "none" }}
        >
          <option value="confirmed">confirmed</option>
          <option value="pending">pending</option>
          <option value="refunded">refunded</option>
        </select>
      </td>
      <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
    </tr>
  );
}
