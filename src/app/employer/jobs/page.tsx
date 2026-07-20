import Link from "next/link";
import { DashHeader, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { JobRowActions } from "@/components/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { listJobsByOwner, countApplicationsByJobSlugs } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function EmployerJobs() {
  const user = await getCurrentUser();
  const jobs = await listJobsByOwner(user!.id);
  const counts = await countApplicationsByJobSlugs(jobs.map((j) => j.slug as string));

  return (
    <>
      <DashHeader
        title="My Jobs"
        subtitle={`${jobs.length} job${jobs.length === 1 ? "" : "s"} posted.`}
        action={<ButtonLink href="/employer/jobs/new"><Icon name="plus" className="h-4 w-4" /> Post a job</ButtonLink>}
      />
      {jobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="You haven't posted any jobs"
          description="Create your first posting to start receiving applications."
          action={<ButtonLink href="/employer/jobs/new">Post a job</ButtonLink>}
        />
      ) : (
        <Panel>
          <Table head={["Title", "Industry", "Location", "Applicants", "Posted", "Status", ""]}>
            {jobs.map((j) => {
              const slug = j.slug as string;
              const n = counts[slug] ?? 0;
              return (
                <tr key={j.id as string}>
                  <td className="px-5 py-3.5 font-semibold text-ink-900">{j.title as string}</td>
                  <td className="px-5 py-3.5 text-slate-600">{j.industryName as string}</td>
                  <td className="px-5 py-3.5 text-slate-600">{j.location as string}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/employer/jobs/${slug}/applicants`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      <Icon name="users" className="h-3.5 w-3.5" />
                      {n} {n === 1 ? "applicant" : "applicants"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{timeAgo(j.createdAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={j.status as string} /></td>
                  <td className="px-5 py-3.5"><JobRowActions slug={slug} editBase="/employer/jobs" /></td>
                </tr>
              );
            })}
          </Table>
        </Panel>
      )}
    </>
  );
}
