import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function DashHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display-2 text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "brand",
}: {
  label: string;
  value: React.ReactNode;
  icon: string;
  hint?: string;
  tone?: "brand" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tones[tone])}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      </div>
      <div className="mt-4 text-3xl font-extrabold text-ink-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-200 bg-sand-50">
            {head.map((h) => (
              <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">{children}</tbody>
      </table>
    </div>
  );
}

const statusTones: Record<string, string> = {
  new: "bg-brand-50 text-brand-700 border-brand-100",
  reviewed: "bg-amber-50 text-amber-700 border-amber-100",
  shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
  read: "bg-slate-100 text-slate-600 border-slate-200",
  open: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  admin: "bg-purple-50 text-purple-700 border-purple-100",
  employer: "bg-brand-50 text-brand-700 border-brand-100",
  seeker: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusTones[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-slate-400">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
