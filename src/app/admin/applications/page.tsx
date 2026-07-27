import { DashHeader, EmptyState } from "@/components/dashboard/ui";
import { ApplicationsTable, type AdminApplication } from "@/components/dashboard/applications-table";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
    resumeFileId: a.resumeFileId ? String(a.resumeFileId) : undefined,
    resumeFileName: a.resumeFileName ? String(a.resumeFileName) : undefined,
  }));

  return (
    <>
      <DashHeader
        title="Applications"
        subtitle={`${apps.length} application${apps.length === 1 ? "" : "s"} received.`}
        action={
          apps.length > 0 ? (
            <ButtonLink href="/api/admin/export/applications" variant="outline" size="md">
              <Icon name="download" className="h-4 w-4" /> Export CSV
            </ButtonLink>
          ) : undefined
        }
      />
      {apps.length === 0 ? (
        <EmptyState title="No applications yet" description="Candidate applications will appear here." />
      ) : (
        <ApplicationsTable apps={rows} />
      )}
    </>
  );
}
