import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { ContactForm } from "@/components/forms/contact-form";
import { services } from "@/content/services";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "For Clients — Staffing & Recruitment in Chicago",
  description:
    "Hire pre-vetted, fully compliant talent across healthcare, construction, electrical, tax & legal, and IT. Around 9 days average time-to-offer. Request talent from Exzelon's Chicago recruiters.",
  path: "/for-clients",
});

// Verifiable proof points — every figure here already appears elsewhere on the site
// (home stats / compliance page / services). No new or invented metrics.
const proofPoints = [
  { icon: "briefcase", text: "Five specialist sectors — Healthcare, Construction, Electrical, Tax & Legal, and IT" },
  { icon: "clock", text: "Around 9 days average time-to-offer" },
  { icon: "badge-check", text: "99% compliance pass rate at placement" },
  { icon: "users-round", text: "Pre-vetted, credentialed candidates — you review only qualified people" },
  { icon: "handshake", text: "85% of clients hire with us again" },
];

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

// Employer-facing view of each sector: the roles Exzelon staffs. Consistent with the
// firm's stated specialization (industries content + llms.txt) — no invented claims.
const sectors = [
  { slug: "healthcare", name: "Healthcare", roles: "Registered nurses, LPNs, travel nurses, allied health, and clinical support staff." },
  { slug: "construction", name: "Construction", roles: "Site supervisors, project managers, estimators, and skilled trades." },
  { slug: "electrical", name: "Electrical", roles: "Journeyman and master electricians, industrial and controls technicians, and field engineers." },
  { slug: "tax-legal", name: "Tax & Legal", roles: "CPAs, tax accountants, paralegals, compliance analysts, and corporate counsel." },
  { slug: "it", name: "Information Technology", roles: "Software engineers, data analysts, cloud and DevOps engineers, and QA professionals." },
];

// Visible employer Q&A — rendered as plain, extractable text (best for AI answer engines).
// Deliberately no FAQPage JSON-LD: Google retired FAQ rich results in May 2026, so the
// value here is on-page clarity + LLM citability, not a SERP feature.
const employerFaqs = [
  {
    q: "Which industries does Exzelon staff?",
    a: "Five specialist sectors: Healthcare, Construction, Electrical, Tax & Legal, and Information Technology. Each has dedicated recruiters who understand the credentials, licensing, and hiring norms of their field.",
  },
  {
    q: "How quickly can you fill a role?",
    a: "Our average time-to-offer is around 9 days, and travel or contract roles can move faster because we work from pre-vetted talent pools. Timelines depend on the role's seniority and credentialing requirements — we'll set a realistic expectation on the intake call.",
  },
  {
    q: "How does pricing work?",
    a: "Exzelon operates on an employer-funded model: employers pay for successful placements, and job seekers use the service free of charge. Fees depend on the role, engagement type, and volume — tell us what you're hiring for and we'll share a clear quote.",
  },
  {
    q: "Do you handle compliance and credentialing?",
    a: "Yes. We verify professional licenses at the primary source, run background and reference checks, complete I-9 and right-to-work verification, and track OSHA and safety certifications for construction and electrical roles. Every candidate is audit-ready before day one.",
  },
  {
    q: "What engagement types do you offer?",
    a: "Full-time and direct hire, contract, temp-to-hire, part-time, and travel assignments — including housing and logistics support for travelers.",
  },
  {
    q: "Where do you place candidates?",
    a: "We're headquartered in Chicago and place candidates across the Chicago metro and nationwide.",
  },
];

export default function ForClientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="For Clients"
        crumbs={[{ label: "For Clients" }]}
        title={<>Build a <span className="text-gradient">world-class team</span>, faster</>}
        description="From a single hard-to-fill role to an entire seasonal workforce, Exzelon delivers pre-vetted, fully compliant talent across five industries — with around a 9-day average time-to-offer."
      >
        <ButtonLink href="#request" variant="accent" size="lg">Request talent</ButtonLink>
        <ButtonLink href="#services" variant="light" size="lg">Explore services</ButtonLink>
      </PageHeader>

      {/* Request talent — embedded inquiry form (high-intent employers convert here, no extra hop) */}
      <Section id="request">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Tell us what you&apos;re <span className="text-gradient">hiring for</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Share your role and we&apos;ll start matching qualified, pre-vetted candidates right away.
              A sector-specialist recruiter will get back to you within one business day.
            </p>

            <ul className="mt-8 space-y-3.5">
              {proofPoints.map((p) => (
                <li key={p.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                    <Icon name={p.icon} className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 rounded-2xl border border-sand-200 bg-sand-50 p-6">
              <p className="text-sm font-semibold text-ink-900">Prefer to talk?</p>
              <div className="mt-3 space-y-2 text-sm">
                <a href={site.phoneHref} className="flex items-center gap-2.5 font-medium text-brand-700 hover:text-brand-800">
                  <Icon name="phone" className="h-4 w-4" /> {site.phone}
                </a>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 font-medium text-brand-700 hover:text-brand-800">
                  <Icon name="mail" className="h-4 w-4" /> {site.email}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)] sm:p-9">
            <ContactForm
              defaultInterest="employer"
              lockInterest
              showCompany
              subjectLabel="Role(s) you're hiring for"
              subjectPlaceholder="e.g. 3 travel RNs, 1 project manager"
              messageLabel="Tell us about your hiring needs"
              messagePlaceholder="Roles, quantity, location, timeline, and any must-have credentials…"
              submitLabel="Request talent"
              successBody="Thanks — a sector-specialist recruiter will review your request and get back to you within one business day."
            />
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section id="services" className="bg-sand-50">
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

      {/* Industries we staff */}
      <Section>
        <SectionHeading
          align="center"
          title="Industries we staff in Chicago and nationwide"
          description="Five sectors, each with dedicated specialist recruiters who know the roles, credentials, and licensing inside out."
        />
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sec) => (
            <MotionItem key={sec.slug} variants={staggerItem}>
              <div className="flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-7 transition-all duration-300 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-bold text-ink-900">{sec.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{sec.roles}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                  <a href="#request" className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800">
                    Discuss {sec.name} hiring <Icon name="arrow-right" className="h-4 w-4" />
                  </a>
                  <ButtonLink href={`/opportunities/${sec.slug}`} variant="ghost" size="sm" className="!px-0 text-slate-500 hover:text-brand-700">
                    View roles
                  </ButtonLink>
                </div>
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

      {/* Employer FAQ */}
      <Section className="bg-sand-50">
        <SectionHeading
          align="center"
          title="Employer questions, answered"
          description="Straight answers on speed, pricing, compliance, and how we work."
        />
        <StaggerGroup className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {employerFaqs.map((f) => (
            <MotionItem key={f.q} variants={staggerItem}>
              <div className="h-full rounded-2xl border border-sand-200 bg-white p-6">
                <h3 className="text-base font-bold text-ink-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      <CtaBanner
        title="Let's build your team"
        subtitle="Tell us what you're hiring for and we'll start matching qualified, pre-vetted candidates right away."
        primary={{ label: "Request Talent", href: "#request" }}
        secondary={{ label: "See Opportunities", href: "/opportunities" }}
      />
    </>
  );
}
