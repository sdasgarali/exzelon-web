import { notFound } from "next/navigation";
import { DashHeader, StatCard, Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ApplicationStatusSelect } from "@/components/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobBySlug, listApplicationsByJobSlug } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function EmployerJobApplicants({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const job = await getJobBySlug(slug);
  // Employers may only view applicants to their own jobs.
  if (!job || job.postedByUserId !== user!.id) notFound();

  const apps = await listApplicationsByJobSlug(slug);
  const byStatus = (s: string) => apps.filter((a) => (a.status as string) === s).length;

  return (
    <>
      <DashHeader
        title={job.title as string}
        subtitle={`${apps.length} candidate${apps.length === 1 ? "" : "s"} applied · ${job.location}`}
        action={
          <>
            <ButtonLink href={`/jobs/${slug}`} target="_blank" variant="outline" size="md">
              <Icon name="eye" className="h-4 w-4" /> View posting
            </ButtonLink>
            <ButtonLink href="/employer/jobs" variant="ghost" size="md">Back to jobs</ButtonLink>
          </>
        }
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-4">
        <StatCard label="Total applicants" value={apps.length} icon="users" tone="brand" />
        <StatCard label="New" value={byStatus("new")} icon="inbox" tone="amber" />
        <StatCard label="Shortlisted" value={byStatus("shortlisted")} icon="award" tone="emerald" />
        <StatCard label="Reviewed" value={byStatus("reviewed")} icon="eye" tone="brand" />
      </div>

      {apps.length === 0 ? (
        <EmptyState
          title="No applicants yet"
          description="When candidates apply to this role, they'll appear here. Share the posting to attract more."
          action={<ButtonLink href={`/jobs/${slug}`} target="_blank">View public posting</ButtonLink>}
        />
      ) : (
        <Panel>
          <Table head={["Candidate", "Contact", "Links", "Applied", "Status"]}>
            {apps.map((a) => (
              <tr key={a.id as string}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{a.name as string}</div>
                  {(a.coverLetter as string) && (
                    <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{a.coverLetter as string}</div>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  <a href={`mailto:${a.email}`} className="text-brand-600 hover:underline">{a.email as string}</a>
                  <div className="text-xs text-slate-400">{a.phone as string}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    {(a.resumeUrl as string) && (
                      <a href={a.resumeUrl as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                        <Icon name="file-text" className="h-3.5 w-3.5" /> Resume
                      </a>
                    )}
                    {(a.linkedin as string) && (
                      <a href={a.linkedin as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                        <Icon name="external-link" className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                    {!(a.resumeUrl as string) && !(a.linkedin as string) && <span className="text-xs text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(a.createdAt)}</td>
                <td className="px-5 py-3.5"><ApplicationStatusSelect id={a.id as string} status={a.status as string} /></td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
