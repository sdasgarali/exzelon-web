import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { CtaBanner } from "@/components/cta-banner";
import { complianceItems } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Compliance",
  description: "How Exzelon handles licensing, credentialing, background screening, and industry standards for every placement.",
  path: "/resources/compliance",
});

export default function CompliancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "Compliance" }]}
        title={<>Compliance you can <span className="text-gradient">count on</span></>}
        description="Every placement is fully vetted, credentialed, and audit-ready. Here's how we keep candidates and clients protected at every step."
      />

      <Section>
        <SectionHeading
          align="center"
          eyebrow="Our standards"
          title="Six pillars of compliance"
          description="Non-negotiable checks that make every Exzelon placement safe and reliable."
        />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complianceItems.map((item) => (
            <MotionItem key={item.title} variants={staggerItem}>
              <div className="group h-full rounded-2xl border border-sand-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name="badge-check" className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      <Section className="bg-sand-50">
        <div className="mx-auto max-w-3xl rounded-4xl border border-sand-200 bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
          <h2 className="text-2xl font-bold text-ink-900">Our commitment</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
            <p>
              Exzelon adheres to all applicable federal, state, and industry-specific employment
              regulations. We verify credentials at the primary source, complete background and
              reference checks appropriate to each role, and confirm right-to-work for every candidate
              we place.
            </p>
            <p>
              For healthcare and other regulated sectors, our credentialing team maintains current,
              audit-ready files and tracks expirations proactively so our clients are never exposed to
              lapses. All candidate and client data is handled under strict privacy and confidentiality
              standards.
            </p>
          </div>
        </div>
      </Section>

      <CtaBanner
        title="Have a compliance question?"
        subtitle="Our credentialing team is happy to walk you through our process in detail."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "For Clients", href: "/for-clients" }}
      />
    </>
  );
}
