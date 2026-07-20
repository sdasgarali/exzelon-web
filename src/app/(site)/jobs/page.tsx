import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { pageMetadata } from "@/lib/seo";
import { listPublicJobs } from "@/lib/db/repo";

export const metadata: Metadata = pageMetadata({
  title: "Jobs",
  description: "Search live job openings across healthcare, construction, electrical, tax & legal, and IT. Filter by industry, type, and location.",
  path: "/jobs",
});

export const revalidate = 30;

export default async function JobsPage() {
  const jobs = await listPublicJobs();
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
        <Suspense fallback={<div className="container-x text-sm text-slate-500">Loading roles…</div>}>
          <JobsExplorer jobs={jobs} />
        </Suspense>
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
