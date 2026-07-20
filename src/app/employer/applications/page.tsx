import { DashHeader, Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { ApplicationStatusSelect } from "@/components/dashboard/actions";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { listJobsByOwner, listApplicationsByJobSlugs } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function EmployerApplications() {
  const user = await getCurrentUser();
  const jobs = await listJobsByOwner(user!.id);
  const slugs = jobs.map((j) => j.slug as string);
  const apps = await listApplicationsByJobSlugs(slugs);

  return (
    <>
      <DashHeader title="Applications" subtitle={`${apps.length} applicant${apps.length === 1 ? "" : "s"} across your jobs.`} />
      {apps.length === 0 ? (
        <EmptyState title="No applications yet" description="Applications to your job postings will appear here." />
      ) : (
        <Panel>
          <Table head={["Candidate", "Contact", "Role", "Applied", "Status"]}>
            {apps.map((a) => (
              <tr key={a.id as string}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{a.name as string}</div>
                  {(a.resumeUrl as string) && (
                    <a href={a.resumeUrl as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                      <Icon name="external-link" className="h-3 w-3" /> Resume
                    </a>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  <div>{a.email as string}</div>
                  <div className="text-xs text-slate-400">{a.phone as string}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{a.jobTitle as string}</td>
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
