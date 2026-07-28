import { DashHeader, StatCard, Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { getConsentSummary, listConsentedVisitors } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Admin view of visitors who accepted the cookie banner (+ any name/email they left). */
export default async function AdminConsentPage() {
  const [summary, visitors] = await Promise.all([getConsentSummary(), listConsentedVisitors()]);

  return (
    <div>
      <DashHeader
        title="Cookie Consent"
        subtitle="Visitors who accepted cookies, and the optional contact details they shared."
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consented visitors" value={summary.accepted} icon="user-check" tone="emerald" />
        <StatCard label="Shared contact details" value={summary.withContact} icon="mail" tone="brand" />
        <StatCard label="Declined" value={summary.declined} icon="x" tone="rose" hint="of decided" />
        <StatCard label="Consent rate" value={`${summary.consentRate}%`} icon="badge-check" tone="amber" />
      </div>

      {visitors.length === 0 ? (
        <EmptyState
          icon="shield-check"
          title="No consents yet"
          description="When visitors accept the cookie banner, they'll appear here — with any name/email they choose to share."
        />
      ) : (
        <Panel>
          <Table head={["Name", "Email", "Source", "Visits", "Last page", "Consented", "Last seen"]}>
            {visitors.map((v) => (
              <tr key={v.id} className="text-slate-700">
                <td className="px-5 py-3.5 font-medium text-ink-900">{v.name || <span className="text-slate-400">—</span>}</td>
                <td className="px-5 py-3.5">
                  {v.email ? (
                    <a href={`mailto:${v.email}`} className="text-brand-600 hover:underline">{v.email}</a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5"><code className="text-xs">{v.source}</code></td>
                <td className="px-5 py-3.5">{v.visitCount}</td>
                <td className="px-5 py-3.5"><code className="text-xs text-slate-500">{v.lastPage || "—"}</code></td>
                <td className="px-5 py-3.5 text-sm">{fmt(v.consentedAt)}</td>
                <td className="px-5 py-3.5 text-sm">{fmt(v.lastSeenAt)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </div>
  );
}
