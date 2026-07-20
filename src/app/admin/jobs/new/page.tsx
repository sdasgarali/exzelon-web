import { DashHeader } from "@/components/dashboard/ui";
import { JobForm } from "@/components/dashboard/job-form";

export default function AdminNewJob() {
  return (
    <>
      <DashHeader title="Post a job" subtitle="Create a new job posting for the public board." />
      <JobForm mode="create" isAdmin backHref="/admin/jobs" />
    </>
  );
}
