export type VideoEmbed = { type: "youtube"; id: string } | { type: "vimeo"; src: string };

export function parseVideo(raw: string): VideoEmbed | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id =
        u.searchParams.get("v") ||
        u.pathname.match(/\/(?:shorts|live|embed)\/([^/?]+)/)?.[1] ||
        u.pathname.split("/").pop();
      if (id) return { type: "youtube", id };
    }
    if (u.hostname.includes("vimeo.com")) {
      return { type: "vimeo", src: `https://player.vimeo.com/video/${u.pathname.split("/").pop()}` };
    }
  } catch { /* ignore */ }
  return null;
}
