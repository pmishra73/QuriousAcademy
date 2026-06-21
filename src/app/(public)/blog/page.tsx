import { getAllBlogsMeta } from "@/lib/blog-blob";
import BlogList from "@/components/BlogList";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllBlogsMeta();
  const published = posts.filter((p) => p.published);
  return <BlogList posts={published} />;
}
