import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { JobCard } from "@/components/cards/job-card";
import { ApplyPanel } from "@/components/forms/apply-panel";
import { JobSaveButton } from "@/components/jobs/job-save-button";
import { getPublicJobBySlug, listPublicJobsByIndustry } from "@/lib/db/repo";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobBySlug(id);
  if (!job) return pageMetadata({ title: "Job" });
  return pageMetadata({
    title: `${job.title} — ${job.location}`,
    description: job.summary,
    path: `/jobs/${job.id}`,
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getPublicJobBySlug(id);
  if (!job) notFound();

  const related = (await listPublicJobsByIndustry(job.industry)).filter((j) => j.id !== job.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary,
    employmentType: job.type,
    hiringOrganization: { "@type": "Organization", name: site.brand, sameAs: site.url },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    industry: job.industryName,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        eyebrow={job.industryName}
        crumbs={[{ label: "Jobs", href: "/jobs" }, { label: job.title }]}
        title={job.title}
        description={job.summary}
      >
        <span className="flex flex-wrap gap-2">
          <Badge className="border-white/20 bg-white/10 text-white"><Icon name="map-pin" className="h-3.5 w-3.5" /> {job.location}</Badge>
          <Badge className="border-white/20 bg-white/10 text-white"><Icon name="briefcase" className="h-3.5 w-3.5" /> {job.type}</Badge>
          <Badge className="border-white/20 bg-white/10 text-white"><Icon name="building-2" className="h-3.5 w-3.5" /> {job.remote}</Badge>
          <Badge className="border-accent-500/30 bg-accent-500/15 text-accent-400"><Icon name="trending-up" className="h-3.5 w-3.5" /> {job.salary}</Badge>
        </span>
      </PageHeader>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr] sm:py-20">
        {/* Details */}
        <div>
          <Reveal>
            <div className="prose-section">
              <h2 className="text-2xl font-bold text-ink-900">About the role</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{job.summary}</p>

              <h3 className="mt-10 text-lg font-bold text-ink-900">Responsibilities</h3>
              <ul className="mt-4 space-y-3">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-slate-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 text-lg font-bold text-ink-900">Requirements</h3>
              <ul className="mt-4 space-y-3">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-slate-700">
                    <Icon name="badge-check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
            <Icon name="clock" className="h-4 w-4" /> Posted {job.posted}
            <span>·</span>
            <Link href={`/opportunities/${job.industry}`} className="font-semibold text-brand-600 hover:text-brand-700">
              More {job.industryName} roles
            </Link>
          </div>
        </div>

        {/* Apply */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-ink-900">Apply for this role</h2>
                <p className="mt-1 text-sm text-slate-500">It takes less than 2 minutes.</p>
              </div>
              <JobSaveButton slug={job.id} />
            </div>
            <div className="mt-6">
              <ApplyPanel jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-sand-200 bg-sand-50 py-16 sm:py-20">
          <div className="container-x">
            <h2 className="display-2 text-2xl font-bold text-ink-900 sm:text-3xl">Similar roles</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
            <div className="mt-10">
              <ButtonLink href="/jobs" variant="outline">
                Back to all jobs <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
