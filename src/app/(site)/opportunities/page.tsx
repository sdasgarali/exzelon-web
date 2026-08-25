import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { IndustryCard } from "@/components/cards/industry-card";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { industries, industryCountWord, industriesShort } from "@/content/industries";
import { jobsEnabled } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Opportunities",
  description: `Explore career opportunities across ${industryCountWord} industries — ${industriesShort} — with specialist recruiters at Exzelon.`,
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
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <MotionItem key={industry.slug} variants={staggerItem}>
              <IndustryCard industry={industry} />
            </MotionItem>
          ))}
        </StaggerGroup>
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
