import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { JobCard } from "@/components/cards/job-card";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { pageMetadata } from "@/lib/seo";
import { searchPublicJobs } from "@/lib/db/repo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Jobs",
  description:
    "Search live job openings across healthcare, construction, electrical, tax & legal, and IT. Filter by industry, type, salary, and location.",
  path: "/jobs",
});

// Reads searchParams → rendered on demand (server-side search + pagination).
export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = one(sp.q);
  const loc = one(sp.loc);
  const industry = one(sp.industry);
  const type = one(sp.type);
  const remote = one(sp.remote);
  const salaryMin = one(sp.salaryMin);
  const sort = (one(sp.sort) as "recent" | "salary") || "recent";
  const page = Math.max(1, parseInt(one(sp.page) ?? "1", 10) || 1);

  const result = await searchPublicJobs({
    q,
    loc,
    industry,
    type,
    remote,
    salaryMin: salaryMin ? parseInt(salaryMin, 10) || undefined : undefined,
    sort,
    page,
  });

  // Preserve the active filters (minus page) for pagination + sort links.
  const baseQuery = { q, loc, industry, type, remote, salaryMin, sort: sort === "recent" ? undefined : sort };
  const sortHref = (s: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, loc, industry, type, remote, salaryMin })) if (v) p.set(k, v);
    if (s !== "recent") p.set("sort", s);
    const qs = p.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    <>
      <PageHeader
        eyebrow="Job Board"
        crumbs={[{ label: "Jobs" }]}
        title={<>Find your next <span className="text-gradient">career move</span></>}
        description="Browse live opportunities across five industries and filter to find your perfect fit."
      >
        <ButtonLink href="/contact" variant="light" size="lg">Submit your resume</ButtonLink>
      </PageHeader>

      <div className="py-16 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[300px_1fr]">
          <JobsFilters />

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-ink-900">{result.total}</span>{" "}
                {result.total === 1 ? "role" : "roles"} found
              </p>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Sort:</span>
                {[
                  { value: "recent", label: "Most recent" },
                  { value: "salary", label: "Salary" },
                ].map((s) => (
                  <Link
                    key={s.value}
                    href={sortHref(s.value)}
                    scroll={false}
                    className={cn(
                      "rounded-lg px-2.5 py-1 font-semibold",
                      sort === s.value ? "bg-brand-600 text-white" : "text-slate-600 hover:text-brand-700"
                    )}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {result.jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-14 text-center">
                <Icon name="search" className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-lg font-bold text-ink-900">No roles match your filters</h3>
                <p className="mt-2 text-sm text-slate-500">Try widening your search or clearing filters.</p>
                <ButtonLink href="/jobs" variant="outline" size="sm" className="mt-6">Clear filters</ButtonLink>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {result.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <JobsPagination page={result.page} totalPages={result.totalPages} query={baseQuery} />
              </>
            )}
          </div>
        </div>
      </div>

      <CtaBanner
        title="Can't find the right role?"
        subtitle="Submit your resume and a specialist recruiter will match you to opportunities as they open."
        primary={{ label: "Submit Resume", href: "/contact" }}
        secondary={{ label: "Explore Industries", href: "/opportunities" }}
      />
    </>
  );
}
