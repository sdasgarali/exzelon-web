import { DashHeader, StatCard } from "@/components/dashboard/ui";
import { ConsentTable } from "@/components/dashboard/consent-table";
import { Icon } from "@/components/ui/icon";
import { getConsentSummary, listConsentedVisitors } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

/** Admin view of visitors who accepted the cookie banner (+ any name/email they left). */
export default async function AdminConsentPage() {
  const [summary, visitors] = await Promise.all([getConsentSummary(), listConsentedVisitors()]);

  return (
    <div>
      <DashHeader
        title="Cookie Consent"
        subtitle="Visitors who accepted cookies, and the optional contact details they shared."
        action={
          visitors.length > 0 ? (
            <a
              href="/api/admin/export/consent"
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700"
            >
              <Icon name="download" className="h-4 w-4" />
              Export CSV
            </a>
          ) : undefined
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consented visitors" value={summary.accepted} icon="user-check" tone="emerald" />
        <StatCard label="Shared contact details" value={summary.withContact} icon="mail" tone="brand" />
        <StatCard label="Declined" value={summary.declined} icon="x" tone="rose" hint="of decided" />
        <StatCard label="Consent rate" value={`${summary.consentRate}%`} icon="badge-check" tone="amber" />
      </div>

      <ConsentTable initial={visitors} />
    </div>
  );
}
