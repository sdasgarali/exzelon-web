import { DashHeader, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PostRowActions } from "@/components/dashboard/actions";
import { listPosts } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminPosts() {
  const posts = await listPosts();

  return (
    <>
      <DashHeader
        title="Blog"
        subtitle={`${posts.length} post${posts.length === 1 ? "" : "s"}.`}
        action={<ButtonLink href="/admin/posts/new"><Icon name="plus" className="h-4 w-4" /> Write a post</ButtonLink>}
      />
      {posts.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="No posts yet"
          description="Write your first blog post."
          action={<ButtonLink href="/admin/posts/new">Write a post</ButtonLink>}
        />
      ) : (
        <Panel>
          <Table head={["Title", "Category", "Author", "Date", "Status", ""]}>
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3.5 font-semibold text-ink-900">
                  {p.title}
                  {p.featured && <Icon name="sparkles" className="ml-1.5 inline h-3.5 w-3.5 text-accent-500" />}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{p.category}</td>
                <td className="px-5 py-3.5 text-slate-600">{p.author}</td>
                <td className="px-5 py-3.5 text-slate-500">
                  {formatDate((p.publishedAt as string | null) ?? (p.createdAt as string))}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3.5"><PostRowActions slug={p.slug} status={p.status} /></td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
