import { notFound } from "next/navigation";
import { DashHeader } from "@/components/dashboard/ui";
import { JobForm } from "@/components/dashboard/job-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobBySlug } from "@/lib/db/repo";

export default async function EmployerEditJob({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const job = await getJobBySlug(slug);
  // Employers may only edit their own jobs.
  if (!job || job.postedByUserId !== user!.id) notFound();

  return (
    <>
      <DashHeader title="Edit job" subtitle={job.title as string} />
      <JobForm
        mode="edit"
        slug={slug}
        backHref="/employer/jobs"
        initial={{
          title: job.title as string,
          industry: job.industry as never,
          location: job.location as string,
          type: job.type as never,
          remote: job.remote as never,
          salary: job.salary as string,
          summary: job.summary as string,
          responsibilities: (job.responsibilities as string[]).join("\n"),
          requirements: (job.requirements as string[]).join("\n"),
          status: job.status as never,
        }}
      />
    </>
  );
}
