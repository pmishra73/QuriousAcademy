import { db } from "@/lib/db";

async function main() {
  const posts = await db.blogPost.findMany({
    select: { slug: true, title: true, published: true, body: true },
  });
  console.log(JSON.stringify(posts.map(p => ({
    slug: p.slug,
    title: p.title,
    published: p.published,
    bodyLen: p.body?.length ?? 0,
  })), null, 2));
  await db.$disconnect();
}
main().catch(console.error);
