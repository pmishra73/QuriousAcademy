"use client";
import { useState } from "react";

export default function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#0a0e1a" }}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: "none", cursor: "pointer",
            backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`, backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          <span style={{
            position: "absolute", inset: 0, background: "rgba(10,14,26,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
