import Link from "next/link";
import { DashHeader, StatCard, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { listApplicationsByUser, getUserById } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function AccountOverview() {
  const user = await getCurrentUser();
  const [apps, dbUser] = await Promise.all([
    listApplicationsByUser(user!.id),
    getUserById(user!.id),
  ]);
  const savedCount = dbUser?.savedJobs?.length ?? 0;
  const activeCount = apps.filter((a) => (a.status as string) !== "rejected").length;

  return (
    <>
      <DashHeader
        title={`Hi, ${user!.name.split(" ")[0]}`}
        subtitle="Track your applications and saved jobs."
        action={<ButtonLink href="/jobs"><Icon name="search" className="h-4 w-4" /> Browse jobs</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Applications" value={apps.length} icon="inbox" tone="brand" />
        <StatCard label="Active" value={activeCount} icon="trending-up" tone="emerald" />
        <StatCard label="Saved jobs" value={savedCount} icon="bookmark" tone="amber" />
      </div>

      <div className="mt-8">
        <Panel>
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="font-bold text-ink-900">My applications</h2>
            <Link href="/account/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {apps.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Find a role that fits and apply — your applications will show up here."
              action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
            />
          ) : (
            <Table head={["Role", "Status", "Applied"]}>
              {apps.slice(0, 6).map((a) => (
                <tr key={a.id as string}>
                  <td className="px-5 py-3.5 font-medium text-ink-900">{a.jobTitle as string}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status as string} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{timeAgo(a.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </>
  );
}
