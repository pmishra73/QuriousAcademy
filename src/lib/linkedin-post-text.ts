export function buildPostText(title: string, excerpt: string, slug: string): string {
  return `${title}\n\n${excerpt}\n\nRead more: https://quriousacademy.com/blog/${slug}`;
}
