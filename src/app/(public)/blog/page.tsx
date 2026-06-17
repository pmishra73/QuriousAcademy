import { getAllPostsMeta, PostMeta } from "@/lib/posts";
import BlogList from "@/components/BlogList";

export default function BlogPage() {
  const posts = getAllPostsMeta();
  return <BlogList posts={posts} />;
}
