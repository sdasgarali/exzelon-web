import { DashHeader, Panel } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function Profile() {
  const user = await getCurrentUser();
  const dbUser = await getUserById(user!.id);

  const rows = [
    { label: "Full name", value: user!.name, icon: "user-round" },
    { label: "Email", value: user!.email, icon: "mail" },
    { label: "Account type", value: "Job Seeker", icon: "briefcase" },
    { label: "Member since", value: dbUser?.createdAt ? timeAgo(dbUser.createdAt) : "—", icon: "clock" },
  ];

  return (
    <>
      <DashHeader title="Profile" subtitle="Your account details." />
      <div className="max-w-2xl">
        <Panel>
          <div className="flex items-center gap-4 border-b border-sand-100 p-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
              {user!.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <div className="text-lg font-bold text-ink-900">{user!.name}</div>
              <div className="text-sm text-slate-500">{user!.email}</div>
            </div>
          </div>
          <dl className="divide-y divide-sand-100">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name={r.icon} className="h-4.5 w-4.5" />
                </span>
                <dt className="w-32 text-sm text-slate-500">{r.label}</dt>
                <dd className="font-medium text-ink-900">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/jobs" variant="primary">Browse jobs <Icon name="arrow-right" className="h-4 w-4" /></ButtonLink>
          <ButtonLink href="/account/applications" variant="outline">My applications</ButtonLink>
        </div>
      </div>
    </>
  );
}
