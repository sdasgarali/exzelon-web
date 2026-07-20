import { DashHeader, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { JobCard } from "@/components/cards/job-card";
import { SaveJobButton } from "@/components/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById, listPublicJobsBySlugs } from "@/lib/db/repo";

export default async function SavedJobs() {
  const user = await getCurrentUser();
  const dbUser = await getUserById(user!.id);
  const slugs = dbUser?.savedJobs ?? [];
  const jobs = await listPublicJobsBySlugs(slugs);

  return (
    <>
      <DashHeader title="Saved Jobs" subtitle={`${jobs.length} saved role${jobs.length === 1 ? "" : "s"}.`} />
      {jobs.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No saved jobs"
          description="Save roles you're interested in and they'll appear here."
          action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-col gap-3">
              <JobCard job={job} />
              <div className="flex justify-end">
                <SaveJobButton slug={job.id} saved />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
