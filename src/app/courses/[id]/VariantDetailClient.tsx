"use client";
import { useState } from "react";
import type { CourseVariant } from "@/lib/variants";
import ContentUnlockModal from "@/components/ContentUnlockModal";

type Cfg = { color: string; bg: string; border: string; label: string };

export default function VariantDetailClient({ variant, cfg }: { variant: CourseVariant; cfg: Cfg }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "block", width: "100%", textAlign: "center",
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          padding: "11px", borderRadius: 8, fontWeight: 600, fontSize: 13,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        View Full Syllabus ↓
      </button>
      {open && <ContentUnlockModal variant={variant} onClose={() => setOpen(false)} />}
    </>
  );
}
