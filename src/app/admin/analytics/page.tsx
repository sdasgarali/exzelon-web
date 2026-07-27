import { DashHeader, StatCard, Panel } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getAnalytics, getAdminStats } from "@/lib/db/repo";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  new: "bg-brand-500",
  reviewed: "bg-amber-500",
  shortlisted: "bg-emerald-500",
  rejected: "bg-rose-500",
};

export default async function AdminAnalytics() {
  const [a, stats] = await Promise.all([getAnalytics(14), getAdminStats()]);

  const maxDay = Math.max(1, ...a.appsByDay.map((d) => d.count));
  const totalApps = Object.values(a.appsByStatus).reduce((s, n) => s + n, 0) || 1;
  const maxIndustry = Math.max(1, ...a.jobsByIndustry.map((i) => i.count));
  const maxJob = Math.max(1, ...a.topJobs.map((j) => j.count));

  return (
    <>
      <DashHeader
        title="Analytics"
        subtitle="Hiring activity across the platform."
        action={
          <>
            <ButtonLink href="/api/admin/export/applications" variant="outline" size="md">
              <Icon name="download" className="h-4 w-4" /> Applications CSV
            </ButtonLink>
            <ButtonLink href="/api/admin/export/users" variant="outline" size="md">
              <Icon name="download" className="h-4 w-4" /> Users CSV
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={stats.appCount} icon="inbox" tone="brand" hint={`${stats.newApps} new`} />
        <StatCard label="Open jobs" value={stats.openJobs} icon="briefcase" tone="emerald" hint={`${stats.jobCount} total`} />
        <StatCard label="Users" value={stats.userCount} icon="users" tone="amber" />
        <StatCard label="Messages" value={stats.contactCount} icon="message-circle" tone="rose" hint={`${stats.newContacts} new`} />
      </div>

      {/* Applications over time */}
      <div className="mt-8">
        <Panel className="p-6">
          <h2 className="font-bold text-ink-900">Applications — last 14 days</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {a.appsByDay.map((d) => (
              <div key={d.date} className="group flex flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-500 opacity-0 group-hover:opacity-100">{d.count}</span>
                <div
                  className="w-full rounded-t bg-brand-500/80 transition-colors group-hover:bg-brand-600"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Funnel */}
        <Panel className="p-6">
          <h2 className="font-bold text-ink-900">Application funnel</h2>
          <div className="mt-5 space-y-4">
            {(["new", "reviewed", "shortlisted", "rejected"] as const).map((s) => {
              const count = a.appsByStatus[s] ?? 0;
              return (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{s}</span>
                    <span className="font-semibold text-ink-900">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand-100">
                    <div className={cn("h-full rounded-full", STATUS_TONE[s])} style={{ width: `${(count / totalApps) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Jobs by industry */}
        <Panel className="p-6">
          <h2 className="font-bold text-ink-900">Open jobs by industry</h2>
          {a.jobsByIndustry.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">No open jobs.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {a.jobsByIndustry.map((i) => (
                <div key={i.industry}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{i.industry}</span>
                    <span className="font-semibold text-ink-900">{i.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(i.count / maxIndustry) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Top roles */}
      <div className="mt-8">
        <Panel className="p-6">
          <h2 className="font-bold text-ink-900">Top roles by applicants</h2>
          {a.topJobs.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">No applications yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {a.topJobs.map((j) => (
                <div key={j.title} className="flex items-center gap-4">
                  <span className="w-48 shrink-0 truncate text-sm font-medium text-ink-900">{j.title}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(j.count / maxJob) * 100}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold text-slate-600">{j.count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
