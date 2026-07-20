import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem, Reveal } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { JobCard } from "@/components/cards/job-card";
import { CtaBanner } from "@/components/cta-banner";
import { industries, getIndustry } from "@/content/industries";
import { listPublicJobsByIndustry } from "@/lib/db/repo";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return pageMetadata({ title: "Opportunities" });
  return pageMetadata({
    title: `${industry.name} Jobs`,
    description: industry.description,
    path: `/opportunities/${industry.slug}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const related = await listPublicJobsByIndustry(industry.slug);

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        crumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: industry.name }]}
        title={industry.headline}
        description={industry.short}
      >
        <ButtonLink href="/jobs" variant="accent" size="lg">View open roles</ButtonLink>
        <ButtonLink href="/contact" variant="light" size="lg">Talk to a recruiter</ButtonLink>
      </PageHeader>

      {/* Overview + stats */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeading
              eyebrow={`${industry.name} recruiting`}
              title={`Your career in ${industry.name.toLowerCase()} starts here`}
              description={industry.description}
            />
            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">Roles we place</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {industry.roles.map((r) => (
                <span key={r} className="rounded-full border border-sand-200 bg-sand-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <Reveal>
            <div className="rounded-4xl border border-sand-200 bg-white p-8 shadow-[var(--shadow-card)]">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Icon name={industry.icon} className="h-7 w-7" strokeWidth={1.7} />
              </span>
              <div className="mt-8 space-y-6">
                {industry.stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between border-b border-sand-100 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500">{s.label}</span>
                    <span className="text-2xl font-extrabold text-ink-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Related jobs */}
      {related.length > 0 && (
        <Section className="bg-sand-50">
          <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
            <SectionHeading
              eyebrow="Now hiring"
              title={`Open ${industry.name} roles`}
              description="Live opportunities matched to this industry."
            />
            <Reveal delay={0.1}>
              <ButtonLink href="/jobs" variant="outline">
                All jobs <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </div>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((job) => (
              <MotionItem key={job.id} variants={staggerItem}>
                <JobCard job={job} />
              </MotionItem>
            ))}
          </StaggerGroup>
        </Section>
      )}

      <CtaBanner
        title={`Ready for your next ${industry.name.toLowerCase()} role?`}
        subtitle="Upload your resume and let a specialist recruiter match you to the right opportunity."
        primary={{ label: "Browse Jobs", href: "/jobs" }}
        secondary={{ label: "Submit Resume", href: "/contact" }}
      />
    </>
  );
}
