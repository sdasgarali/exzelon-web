"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jobTypes, workModes, type Job } from "@/content/jobs";
import { industries } from "@/content/industries";
import { JobCard } from "@/components/cards/job-card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JobsExplorer({ jobs }: { jobs: Job[] }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [loc, setLoc] = useState(params.get("loc") ?? "");
  const [industry, setIndustry] = useState<string>(params.get("industry") ?? "all");
  const [type, setType] = useState<string>("all");
  const [mode, setMode] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const location = loc.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.industryName.toLowerCase().includes(query) ||
        job.summary.toLowerCase().includes(query);
      const matchesLoc = !location || job.location.toLowerCase().includes(location);
      const matchesIndustry = industry === "all" || job.industry === industry;
      const matchesType = type === "all" || job.type === type;
      const matchesMode = mode === "all" || job.remote === mode;
      return matchesQuery && matchesLoc && matchesIndustry && matchesType && matchesMode;
    });
  }, [jobs, q, loc, industry, type, mode]);

  const reset = () => {
    setQ("");
    setLoc("");
    setIndustry("all");
    setType("all");
    setMode("all");
  };

  const hasFilters = q || loc || industry !== "all" || type !== "all" || mode !== "all";

  return (
    <div className="container-x grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* Filters sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink-900">Filters</h2>
            {hasFilters && (
              <button onClick={reset} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Clear all
              </button>
            )}
          </div>

          <div className="mt-5 space-y-5">
            <Field label="Keyword">
              <div className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3">
                <Icon name="search" className="h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Title or keyword"
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </Field>

            <Field label="Location">
              <div className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3">
                <Icon name="map-pin" className="h-4 w-4 text-slate-400" />
                <input
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="City or state"
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </Field>

            <Field label="Industry">
              <ChipGroup
                value={industry}
                onChange={setIndustry}
                options={[{ value: "all", label: "All" }, ...industries.map((i) => ({ value: i.slug, label: i.name }))]}
              />
            </Field>

            <Field label="Job type">
              <ChipGroup
                value={type}
                onChange={setType}
                options={[{ value: "all", label: "All" }, ...jobTypes.map((t) => ({ value: t, label: t }))]}
              />
            </Field>

            <Field label="Work mode">
              <ChipGroup
                value={mode}
                onChange={setMode}
                options={[{ value: "all", label: "All" }, ...workModes.map((m) => ({ value: m, label: m }))]}
              />
            </Field>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-ink-900">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "role" : "roles"} found
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-14 text-center">
            <Icon name="search" className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-ink-900">No roles match your filters</h3>
            <p className="mt-2 text-sm text-slate-500">Try widening your search or clearing filters.</p>
            <Button onClick={reset} variant="outline" size="sm" className="mt-6">Clear filters</Button>
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </div>
  );
}

function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-sand-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
