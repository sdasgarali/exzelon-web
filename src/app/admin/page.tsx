import Link from "next/link";
import { DashHeader, StatCard, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getAdminStats, listApplications, listContacts } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function AdminOverview() {
  const [stats, apps, contacts] = await Promise.all([
    getAdminStats(),
    listApplications(),
    listContacts(),
  ]);
  const recentApps = apps.slice(0, 5);
  const recentMsgs = contacts.slice(0, 5);

  return (
    <>
      <DashHeader
        title="Overview"
        subtitle="Everything happening across Exzelon at a glance."
        action={<ButtonLink href="/admin/jobs/new" size="md"><Icon name="plus" className="h-4 w-4" /> Post a job</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.userCount} icon="users" tone="brand" />
        <StatCard label="Open jobs" value={stats.openJobs} icon="briefcase" hint={`${stats.jobCount} total`} tone="emerald" />
        <StatCard label="Applications" value={stats.appCount} icon="inbox" hint={`${stats.newApps} new`} tone="amber" />
        <StatCard label="Messages" value={stats.contactCount} icon="message-circle" hint={`${stats.newContacts} new`} tone="rose" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="font-bold text-ink-900">Recent applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {recentApps.length === 0 ? (
            <EmptyState title="No applications yet" description="Applications will appear here as candidates apply." />
          ) : (
            <Table head={["Candidate", "Role", "Status", "When"]}>
              {recentApps.map((a) => (
                <tr key={a.id as string}>
                  <td className="px-5 py-3.5 font-medium text-ink-900">{a.name as string}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.jobTitle as string}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status as string} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{timeAgo(a.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="font-bold text-ink-900">Recent messages</h2>
            <Link href="/admin/messages" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {recentMsgs.length === 0 ? (
            <EmptyState icon="message-circle" title="No messages yet" description="Contact form submissions will appear here." />
          ) : (
            <Table head={["From", "Subject", "Status", "When"]}>
              {recentMsgs.map((m) => (
                <tr key={m.id as string}>
                  <td className="px-5 py-3.5 font-medium text-ink-900">{m.name as string}</td>
                  <td className="px-5 py-3.5 text-slate-600">{m.subject as string}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={m.status as string} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{timeAgo(m.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </>
  );
}
