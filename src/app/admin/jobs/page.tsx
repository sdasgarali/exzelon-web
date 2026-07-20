import { DashHeader, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { JobRowActions } from "@/components/dashboard/actions";
import { listJobs, countApplicationsByJobSlugs } from "@/lib/db/repo";

export default async function AdminJobs() {
  const jobs = await listJobs();
  const counts = await countApplicationsByJobSlugs(jobs.map((j) => j.slug as string));

  return (
    <>
      <DashHeader
        title="Jobs"
        subtitle={`${jobs.length} job${jobs.length === 1 ? "" : "s"} in the system.`}
        action={<ButtonLink href="/admin/jobs/new"><Icon name="plus" className="h-4 w-4" /> Post a job</ButtonLink>}
      />
      {jobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No jobs yet"
          description="Create your first job posting."
          action={<ButtonLink href="/admin/jobs/new">Post a job</ButtonLink>}
        />
      ) : (
        <Panel>
          <Table head={["Title", "Industry", "Location", "Applicants", "Posted by", "Status", ""]}>
            {jobs.map((j) => (
              <tr key={j.id as string}>
                <td className="px-5 py-3.5 font-semibold text-ink-900">
                  {j.title as string}
                  {(j.featured as boolean) && <Icon name="sparkles" className="ml-1.5 inline h-3.5 w-3.5 text-accent-500" />}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{j.industryName as string}</td>
                <td className="px-5 py-3.5 text-slate-600">{j.location as string}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
                    <Icon name="users" className="h-3.5 w-3.5" />
                    {counts[j.slug as string] ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{j.postedByName as string}</td>
                <td className="px-5 py-3.5"><StatusBadge status={j.status as string} /></td>
                <td className="px-5 py-3.5"><JobRowActions slug={j.slug as string} editBase="/admin/jobs" /></td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
