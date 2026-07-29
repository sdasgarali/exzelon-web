import { notFound } from "next/navigation";
import { DashHeader } from "@/components/dashboard/ui";
import { PostForm } from "@/components/dashboard/post-form";
import { getPostForAdmin } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function AdminEditPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostForAdmin(slug);
  if (!post) notFound();

  return (
    <>
      <DashHeader title="Edit post" subtitle={post.title} />
      <PostForm
        mode="edit"
        slug={slug}
        backHref="/admin/posts"
        initial={{
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          body: post.body,
          coverImageUrl: post.coverImageUrl ?? "",
          author: post.author,
          status: post.status,
          featured: post.featured,
        }}
      />
    </>
  );
}
