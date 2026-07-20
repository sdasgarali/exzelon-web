import Link from "next/link";
import type { Job } from "@/content/jobs";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const typeColor: Record<Job["type"], string> = {
  "Full-time": "text-emerald-700 bg-emerald-50 border-emerald-100",
  Contract: "text-brand-700 bg-brand-50 border-brand-100",
  Travel: "text-purple-700 bg-purple-50 border-purple-100",
  "Part-time": "text-amber-700 bg-amber-50 border-amber-100",
  "Temp-to-hire": "text-rose-700 bg-rose-50 border-rose-100",
};

export function JobCard({ job, className }: { job: Job; className?: string }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_28px_60px_-30px_rgba(15,35,79,0.4)]",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
            typeColor[job.type]
          )}
        >
          {job.type}
        </span>
        {job.featured && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600">
            <Icon name="sparkles" className="h-3.5 w-3.5" /> Featured
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">
        {job.title}
      </h3>
      <p className="mt-1 text-sm font-medium text-brand-600">{job.industryName}</p>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{job.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge><Icon name="map-pin" className="h-3.5 w-3.5" /> {job.location}</Badge>
        <Badge><Icon name="building-2" className="h-3.5 w-3.5" /> {job.remote}</Badge>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-sm font-bold text-ink-900">{job.salary}</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-600">
          View role
          <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
