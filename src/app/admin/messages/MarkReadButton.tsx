"use client";
import { useRouter } from "next/navigation";

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  async function mark() {
    await fetch("/api/admin/messages/mark-read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }
  return (
    <button onClick={mark} style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
      Mark as read
    </button>
  );
}
