import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { values } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "Who we are, our mission and vision, and the values we hire by at Exzelon — NextGen Hires.",
  path: "/about",
});

const missionVision = [
  {
    icon: "target",
    title: "Our Mission",
    body: "To connect skilled professionals with meaningful careers and help employers build exceptional teams — quickly, fairly, and with full compliance at every step.",
  },
  {
    icon: "trending-up",
    title: "Our Vision",
    body: "To be the most trusted next-generation hiring partner in the industries we serve, where every placement moves a career and a company forward.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        crumbs={[{ label: "About Us" }]}
        title={<>Hiring, <span className="text-gradient">reimagined</span> for the next generation</>}
        description="Exzelon — NextGen Hires is a specialist recruitment and staffing partner connecting talented professionals with the right opportunities across five industries."
      >
        <ButtonLink href="/contact" variant="accent" size="lg">Work with us</ButtonLink>
        <ButtonLink href="/jobs" variant="light" size="lg">Browse jobs</ButtonLink>
      </PageHeader>

      {/* Who we are */}
      <Section id="who-we-are">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="A team of specialists who care about the outcome"
              description="We're recruiters, credentialing experts, and industry insiders who believe hiring should be human. Every day we match compassionate nurses, skilled tradespeople, sharp accountants, and brilliant engineers with employers who value them."
            />
            <p className="mt-5 leading-relaxed text-slate-600">
              Headquartered in Chicago, Exzelon serves employers and job seekers across the United States.
              What sets us apart is specialization — dedicated recruiters in each sector who understand the
              credentials, culture, and cadence of the work — paired with a relentless focus on compliance
              and candidate experience.
            </p>
          </div>
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "users", value: "1,200+", label: "Employers served" },
                { icon: "award", value: "25,000+", label: "Careers moved" },
                { icon: "star", value: "4.4/5", label: "Candidate rating" },
                { icon: "badge-check", value: "99%", label: "Compliance pass rate" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <div className="mt-4 text-2xl font-extrabold text-ink-900">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section id="mission" className="bg-sand-50">
        <SectionHeading align="center" title="What drives us forward" />
        <StaggerGroup className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {missionVision.map((m) => (
            <MotionItem key={m.title} variants={staggerItem}>
              <div className="h-full rounded-2xl border border-sand-200 bg-white p-8 shadow-[var(--shadow-card)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon name={m.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-ink-900">{m.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{m.body}</p>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Values */}
      <Section id="values">
        <SectionHeading
          align="center"
          title="The principles we hire by"
          description="Six commitments that shape every placement and every partnership."
        />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <MotionItem key={v.title} variants={staggerItem}>
              <div className="group h-full rounded-2xl border border-sand-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.description}</p>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      <CtaBanner
        title="Ready to work with a partner who cares about the outcome?"
        subtitle="Whether you're growing a team or growing your career, let's talk."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "For Clients", href: "/for-clients" }}
      />
    </>
  );
}
