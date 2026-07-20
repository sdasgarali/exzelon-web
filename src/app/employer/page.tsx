import Link from "next/link";
import { DashHeader, StatCard, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { listJobsByOwner, listApplicationsByJobSlugs } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function EmployerOverview() {
  const user = await getCurrentUser();
  const jobs = await listJobsByOwner(user!.id);
  const slugs = jobs.map((j) => j.slug as string);
  const apps = await listApplicationsByJobSlugs(slugs);
  const openJobs = jobs.filter((j) => (j.status as string) === "open").length;
  const newApps = apps.filter((a) => (a.status as string) === "new").length;

  return (
    <>
      <DashHeader
        title={`Welcome, ${user!.name.split(" ")[0]}`}
        subtitle="Manage your job postings and review applicants."
        action={<ButtonLink href="/employer/jobs/new"><Icon name="plus" className="h-4 w-4" /> Post a job</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Your jobs" value={jobs.length} icon="briefcase" hint={`${openJobs} open`} tone="brand" />
        <StatCard label="Applications" value={apps.length} icon="inbox" hint={`${newApps} new`} tone="amber" />
        <StatCard label="Open positions" value={openJobs} icon="trending-up" tone="emerald" />
      </div>

      <div className="mt-8">
        <Panel>
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="font-bold text-ink-900">Recent applications</h2>
            <Link href="/employer/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {apps.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Once candidates apply to your jobs, they'll show up here."
              action={<ButtonLink href="/employer/jobs/new">Post your first job</ButtonLink>}
            />
          ) : (
            <Table head={["Candidate", "Role", "Status", "When"]}>
              {apps.slice(0, 6).map((a) => (
                <tr key={a.id as string}>
                  <td className="px-5 py-3.5 font-medium text-ink-900">{a.name as string}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.jobTitle as string}</td>
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
