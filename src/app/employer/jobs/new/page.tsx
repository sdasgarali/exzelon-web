import { DashHeader } from "@/components/dashboard/ui";
import { JobForm } from "@/components/dashboard/job-form";

export default function EmployerNewJob() {
  return (
    <>
      <DashHeader title="Post a job" subtitle="Your posting goes live on the public job board." />
      <JobForm mode="create" backHref="/employer/jobs" />
    </>
  );
}
