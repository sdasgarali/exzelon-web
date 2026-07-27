"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jobTypes, workModes } from "@/content/jobs";
import { industries } from "@/content/industries";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const SALARY_OPTIONS = [
  { value: "0", label: "Any" },
  { value: "50000", label: "$50k+" },
  { value: "75000", label: "$75k+" },
  { value: "100000", label: "$100k+" },
  { value: "150000", label: "$150k+" },
];

/**
 * URL-driven job filters. Every change writes to the query string and lets the
 * server page re-query + paginate. Text inputs are debounced; selecting a filter
 * resets to page 1.
 */
export function JobsFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [loc, setLoc] = useState(params.get("loc") ?? "");
  const industry = params.get("industry") ?? "all";
  const type = params.get("type") ?? "all";
  const mode = params.get("remote") ?? "all";
  const salary = params.get("salaryMin") ?? "0";

  const push = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params.toString());
    mut(p);
    p.delete("page"); // any filter change returns to the first page
    startTransition(() => router.push(`/jobs?${p.toString()}`, { scroll: false }));
  };

  const setParam = (key: string, value: string, clearWhen = "all") =>
    push((p) => (value && value !== clearWhen ? p.set(key, value) : p.delete(key)));

  // Debounce free-text (keyword/location) so we don't navigate on every keystroke.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      push((p) => {
        if (q.trim()) p.set("q", q.trim());
        else p.delete("q");
        if (loc.trim()) p.set("loc", loc.trim());
        else p.delete("loc");
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, loc]);

  const reset = () => {
    setQ("");
    setLoc("");
    startTransition(() => router.push("/jobs", { scroll: false }));
  };

  const hasFilters =
    q || loc || industry !== "all" || type !== "all" || mode !== "all" || salary !== "0";

  return (
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

          <Field label="Minimum salary">
            <ChipGroup value={salary} onChange={(v) => setParam("salaryMin", v, "0")} options={SALARY_OPTIONS} />
          </Field>

          <Field label="Industry">
            <ChipGroup
              value={industry}
              onChange={(v) => setParam("industry", v)}
              options={[{ value: "all", label: "All" }, ...industries.map((i) => ({ value: i.slug, label: i.name }))]}
            />
          </Field>

          <Field label="Job type">
            <ChipGroup
              value={type}
              onChange={(v) => setParam("type", v)}
              options={[{ value: "all", label: "All" }, ...jobTypes.map((t) => ({ value: t, label: t }))]}
            />
          </Field>

          <Field label="Work mode">
            <ChipGroup
              value={mode}
              onChange={(v) => setParam("remote", v)}
              options={[{ value: "all", label: "All" }, ...workModes.map((m) => ({ value: m, label: m }))]}
            />
          </Field>
        </div>
      </div>
    </aside>
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
