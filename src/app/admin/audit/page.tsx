import { DashHeader, Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { listAuditLogs } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

const ACTION_LABEL: Record<string, string> = {
  "user.role": "Role changed",
  "user.delete": "User deleted",
  "job.delete": "Job deleted",
  "application.status": "Status changed",
};

export default async function AdminAudit() {
  const logs = await listAuditLogs(200);

  return (
    <>
      <DashHeader title="Audit log" subtitle="A record of administrative actions." />
      {logs.length === 0 ? (
        <EmptyState icon="shield-check" title="No activity yet" description="Admin actions (role changes, deletions, status updates) will be recorded here." />
      ) : (
        <Panel>
          <Table head={["Action", "Target", "Detail", "By", "When"]}>
            {logs.map((l) => (
              <tr key={l.id as string}>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-ink-900">{ACTION_LABEL[l.action as string] ?? (l.action as string)}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{(l.target as string) || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">
                  {l.detail ? <span className="font-mono text-xs">{String(l.detail)}</span> : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{l.actorName as string}</td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(l.createdAt)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
