import { DashHeader, EmptyState } from "@/components/dashboard/ui";
import { ApplicationsTable, type AdminApplication } from "@/components/dashboard/applications-table";
import { listApplications } from "@/lib/db/repo";

export default async function AdminApplications() {
  const apps = await listApplications();

  const rows: AdminApplication[] = apps.map((a) => ({
    id: String(a.id),
    name: String(a.name ?? ""),
    email: String(a.email ?? ""),
    phone: a.phone ? String(a.phone) : "",
    jobTitle: String(a.jobTitle ?? ""),
    status: String(a.status ?? "new"),
    createdAt: String(a.createdAt ?? ""),
    resumeUrl: a.resumeUrl ? String(a.resumeUrl) : "",
  }));

  return (
    <>
      <DashHeader title="Applications" subtitle={`${apps.length} application${apps.length === 1 ? "" : "s"} received.`} />
      {apps.length === 0 ? (
        <EmptyState title="No applications yet" description="Candidate applications will appear here." />
      ) : (
        <ApplicationsTable apps={rows} />
      )}
    </>
  );
}
