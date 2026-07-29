import { DashHeader } from "@/components/dashboard/ui";
import { PostForm } from "@/components/dashboard/post-form";

export default function AdminNewPost() {
  return (
    <>
      <DashHeader title="Write a post" subtitle="Publish a new article to the public blog." />
      <PostForm mode="create" backHref="/admin/posts" />
    </>
  );
}
