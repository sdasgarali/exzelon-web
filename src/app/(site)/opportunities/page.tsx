import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem, Reveal } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { IndustryCard } from "@/components/cards/industry-card";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { industries, industryCountWord } from "@/content/industries";
import { jobsEnabled } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  // Was a bare "Opportunities" — 39 characters with no query signal at all on the hub that
  // groups every industry page. This page ranks for the broad
  // "[industry] staffing / construction staffing" family but had lost its remaining clicks
  // (2 → 0 over the 2026-10-09 → 11-05 window), so give it the city and the service.
  title: "Staffing Opportunities in Chicago",
  description: `Browse ${industryCountWord} industries we staff — healthcare, IT, construction, electrical, engineering, finance and more — with specialist recruiters.`,
  path: "/opportunities",
});

export default function OpportunitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        crumbs={[{ label: "Opportunities" }]}
        title={<>Careers across <span className="text-gradient">{industryCountWord} industries</span></>}
        description="Whatever your field, we have a specialist recruiter and a network of employers ready for you. Pick an industry to explore how we can help."
        align="center"
      >
        {jobsEnabled ? (
          <ButtonLink href="/jobs" variant="accent" size="lg">Browse all jobs</ButtonLink>
        ) : (
          <ButtonLink href="/contact" variant="accent" size="lg">Submit your CV</ButtonLink>
        )}
      </PageHeader>

      <Section>
        {/* The grid's card titles are <h3>, so without this the page ran H1 → H3 with no H2
            (measured on the live HTML) and the hub that groups every industry page carried no
            heading for the grouping itself. */}
        <SectionHeading
          eyebrow="Industries we staff"
          title="Pick the sector you hire in"
          description={`Each of the ${industryCountWord} practices below is worked by recruiters who cover that market every week — the roles, the credentials, and what a strong candidate actually looks like.`}
        />
        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <MotionItem key={industry.slug} variants={staggerItem}>
              <IndustryCard industry={industry} />
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      <Section className="bg-sand-50">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="How it works"
            title="One recruiter who knows your field"
            description={`We don't run a single CV database with a search box. Each of the ${industryCountWord} sectors below is covered by recruiters who work that market every week — the roles, the credentials, and what a strong candidate actually looks like.`}
          />
          <Reveal delay={0.1}>
            <div className="space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                Candidates get one point of contact who can say what a role pays in this market, which
                employers hire on the schedule they want, and what the hiring process really looks
                like before they commit to it. Applying through us is free, and no CV goes to an
                employer without your agreement.
              </p>
              <p>
                Employers get shortlists screened against what actually matters in the sector —
                licences, certifications, shift availability, and safety record — rather than a pile
                of resumes to sort. To see how an engagement runs from intake to start date, read{" "}
                <Link
                  href="/resources/blog/how-to-hire-through-a-staffing-agency-chicago"
                  className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
                >
                  how to hire through a staffing agency in Chicago
                </Link>
                , or go straight to{" "}
                <Link
                  href="/for-clients"
                  className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
                >
                  how we work with employers
                </Link>
                .
              </p>
              <p className="text-base text-slate-500">
                Not sure which sector fits your background? Send your CV through{" "}
                <Link href="/contact" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800">
                  contact
                </Link>{" "}
                and a recruiter will point you to the right one.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBanner
        title="Don't see your field?"
        subtitle="We're always expanding. Send us your resume and we'll reach out when the right role opens up."
        primary={{ label: "Submit your CV", href: "/contact" }}
        secondary={jobsEnabled ? { label: "Browse Jobs", href: "/jobs" } : { label: "Talk to a recruiter", href: "/contact" }}
      />
    </>
  );
}
