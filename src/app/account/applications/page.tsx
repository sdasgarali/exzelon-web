import Link from "next/link";
import { DashHeader, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { listApplicationsByUser } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function MyApplications() {
  const user = await getCurrentUser();
  const apps = await listApplicationsByUser(user!.id);

  return (
    <>
      <DashHeader title="My Applications" subtitle={`${apps.length} application${apps.length === 1 ? "" : "s"}.`} />
      {apps.length === 0 ? (
        <EmptyState
          title="You haven't applied yet"
          description="Browse open roles and apply — you'll track them here."
          action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
        />
      ) : (
        <Panel>
          <Table head={["Role", "Applied", "Status", ""]}>
            {apps.map((a) => (
              <tr key={a.id as string}>
                <td className="px-5 py-3.5 font-semibold text-ink-900">{a.jobTitle as string}</td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(a.createdAt)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status as string} /></td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/jobs/${a.jobSlug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">View role</Link>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
