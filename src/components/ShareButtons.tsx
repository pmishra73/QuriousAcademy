"use client";
import { useState } from "react";
import { Link2, Check } from "lucide-react";

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
  background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)",
  cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
};

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.87.24-1.46 1.5-1.46h1.6V4.37c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.02V10.5H8v3h2.35V21h3.15z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 3H21.7L15.5 10.2 22.8 21h-6.3l-4.9-6.5L5.9 21H3.1l6.6-7.6L2.8 3h6.5l4.5 5.9L18.9 3zm-1.1 16.2h1.7L7.3 4.7H5.5l12.3 14.5z" />
    </svg>
  );
}

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 2 }}>Share:</span>
      <button
        type="button"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
        onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        style={iconBtn}
      >
        <LinkedInIcon />
      </button>
      <button
        type="button"
        title="Share on Facebook"
        aria-label="Share on Facebook"
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        style={iconBtn}
      >
        <FacebookIcon />
      </button>
      <button
        type="button"
        title="Share on X / Twitter"
        aria-label="Share on X / Twitter"
        onClick={() => open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
        style={iconBtn}
      >
        <XIcon />
      </button>
      <button
        type="button"
        title={copied ? "Link copied" : "Copy link"}
        aria-label="Copy link"
        onClick={copyLink}
        style={{ ...iconBtn, color: copied ? "#34d399" : iconBtn.color, borderColor: copied ? "rgba(52,211,153,0.4)" : "var(--border)" }}
      >
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
