import Link from "next/link";
import type { Industry } from "@/content/industries";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function IndustryCard({ industry, className }: { industry: Industry; className?: string }) {
  return (
    <Link
      href={`/opportunities/${industry.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-[0_30px_60px_-30px_rgba(15,35,79,0.45)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          industry.accent
        )}
      />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={industry.icon} className="h-7 w-7" strokeWidth={1.8} />
      </div>
      <h3 className="relative mt-6 text-xl font-bold text-ink-900">{industry.name}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{industry.short}</p>

      <div className="relative mt-6 flex flex-wrap gap-1.5">
        {industry.roles.slice(0, 3).map((r) => (
          <span key={r} className="rounded-md bg-sand-100 px-2 py-1 text-xs font-medium text-slate-600">
            {r}
          </span>
        ))}
      </div>

      <span className="relative mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-600">
        Explore roles
        <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
