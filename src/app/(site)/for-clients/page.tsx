import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "For Clients",
  description: "Recruitment, staffing, travelers, direct hire, onboarding, and administration — six ways Exzelon helps employers build and manage a world-class workforce.",
  path: "/for-clients",
});

const whyUs = [
  { icon: "gauge", title: "Speed", body: "Pre-vetted talent pools mean we fill roles in days, not weeks — without cutting corners." },
  { icon: "badge-check", title: "Compliance", body: "Licensing, credentialing, and background checks handled end-to-end, audit-ready." },
  { icon: "target", title: "Specialization", body: "Sector-expert recruiters who actually understand the roles they're filling." },
  { icon: "handshake", title: "Partnership", body: "85% of our clients hire with us again. We build relationships, not transactions." },
];

const process = [
  { n: "01", title: "Discovery", body: "We learn your roles, culture, and hiring goals in a short intake call." },
  { n: "02", title: "Sourcing", body: "We tap our vetted database and active networks to shortlist the best-fit candidates." },
  { n: "03", title: "Screening", body: "Skills, credentials, and culture-fit checks — you only see qualified people." },
  { n: "04", title: "Placement", body: "We manage offer, onboarding, and compliance so day one goes smoothly." },
];

export default function ForClientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="For Clients"
        crumbs={[{ label: "For Clients" }]}
        title={<>Build a <span className="text-gradient">world-class team</span>, faster</>}
        description="From a single hard-to-fill role to an entire seasonal workforce, Exzelon delivers pre-vetted, fully compliant talent across five industries."
      >
        <ButtonLink href="/contact" variant="accent" size="lg">Request talent</ButtonLink>
        <ButtonLink href="#services" variant="light" size="lg">Explore services</ButtonLink>
      </PageHeader>

      {/* Services */}
      <Section id="services">
        <SectionHeading
          align="center"
          title="Six ways we help you hire and manage talent"
          description="A complete workforce solution — from finding the right people to keeping them supported."
        />
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <MotionItem key={s.slug} variants={staggerItem}>
              <div className="group flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-50 p-3.5 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={s.icon} className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 text-xl font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.description}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                      <Icon name="check" className="h-4 w-4 shrink-0 text-brand-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Why us */}
      <Section className="bg-sand-50">
        <SectionHeading align="center" title="What makes us different" />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <MotionItem key={w.title} variants={staggerItem}>
              <div className="h-full rounded-2xl border border-sand-200 bg-white p-7 text-center shadow-[var(--shadow-card)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon name={w.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.body}</p>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Process */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            title="A simple, proven hiring process"
            description="Four steps from first call to first day — with Exzelon handling the heavy lifting."
          />
          <StaggerGroup className="space-y-4">
            {process.map((p) => (
              <MotionItem key={p.n} variants={staggerItem}>
                <div className="group flex items-start gap-5 rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                  <span className="text-3xl font-extrabold text-brand-200 transition-colors group-hover:text-brand-500">{p.n}</span>
                  <div>
                    <h3 className="text-lg font-bold text-ink-900">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.body}</p>
                  </div>
                </div>
              </MotionItem>
            ))}
          </StaggerGroup>
        </div>
      </Section>

      <CtaBanner
        title="Let's build your team"
        subtitle="Tell us what you're hiring for and we'll start matching qualified, pre-vetted candidates right away."
        primary={{ label: "Request Talent", href: "/contact" }}
        secondary={{ label: "See Opportunities", href: "/opportunities" }}
      />
    </>
  );
}
