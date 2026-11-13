import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, staggerItem, Reveal } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  // Was a bare "Resources" — nine characters with no query or topic signal on the page that
  // aggregates the guides, the FAQ and the compliance standards.
  title: "Staffing Resources & Hiring Guides",
  description: "Hiring guides, Chicago salary context, FAQs, compliance standards and feedback — the reference pages employers and job seekers use most with Exzelon.",
  path: "/resources",
});

const cards = [
  { href: "/resources/blog", icon: "file-text", title: "Blog", desc: "Career and hiring insights from our recruiting team." },
  { href: "/resources/faq", icon: "message-circle", title: "FAQ", desc: "Answers to the most common questions from candidates and clients." },
  { href: "/resources/compliance", icon: "badge-check", title: "Compliance", desc: "How we handle licensing, credentialing, and standards." },
  { href: "/resources/feedback", icon: "star", title: "Feedback", desc: "Share your experience and help us improve." },
];

const externalCards = [
  {
    href: "https://efficienco.com/tools/",
    icon: "pencil-ruler",
    title: "Construction calculators",
    desc: "Free takeoff and material calculators from Efficienco — concrete, block, lumber, bitumen and trade estimators that our construction and electrical clients find useful when pricing a job.",
  },
];

/**
 * The hub is linked from every page in the site (header nav + footer), but it linked no article:
 * all 28 published guides received their only internal link from /resources/blog or from the
 * three-post "Keep reading" block, and four of them (construction, healthcare, distribution,
 * working-in-the-USA) had exactly one inbound link — i.e. they were reachable from one place on
 * the whole site while sitting at positions 16-25 for live queries. These six are the pillars the
 * sector pages and the blog point at most; listing them here gives each a stable inbound link
 * from a page every crawler visits. Slugs must stay in sync with the published posts.
 */
const guides = [
  {
    slug: "best-staffing-agencies-in-chicago-how-to-choose",
    title: "Best staffing agencies in Chicago",
    desc: "How to compare agencies on fee model, fill rate and terms — and what the pitch decks leave out.",
  },
  {
    slug: "how-staffing-agencies-work-a-guide-for-job-seekers",
    title: "How staffing agencies work",
    desc: "What an agency actually does, whether it costs a candidate anything, and how recruiters get paid.",
  },
  {
    slug: "working-in-the-usa-guide",
    title: "Navigating the U.S. job market",
    desc: "Licensing, credentials and hiring conventions skilled professionals meet when they move to the US.",
  },
  {
    slug: "construction-staffing-chicago",
    title: "Construction staffing in Chicago",
    desc: "Why municipal licensing and the union split change a trades search, and how to fill crews on schedule.",
  },
  {
    slug: "healthcare-staffing-chicago-how-to-hire",
    title: "Healthcare staffing in Chicago",
    desc: "Where clinical talent sits, why roles stall at credentialing, and what actually decides a start date.",
  },
  {
    slug: "distribution-staffing-chicago-how-to-hire",
    title: "Distribution staffing in Chicago",
    desc: "Pricing, screening and shift structure for warehouse roles in the metro's freight corridors.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        crumbs={[{ label: "Resources" }]}
        title={<>Guides, answers &amp; <span className="text-gradient">standards</span></>}
        description="Everything you need to navigate your job search or hiring process with confidence."
        align="center"
      />
      <Section>
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {cards.map((c) => (
            <MotionItem key={c.href} variants={staggerItem}>
              <Link
                href={c.href}
                className="group flex h-full items-start gap-5 rounded-2xl border border-sand-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={c.icon} className="h-7 w-7" strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
                    {c.title}
                    <Icon name="arrow-up-right" className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                </div>
              </Link>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-bold text-ink-900">Guides our clients read first</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          The long-form articles employers and candidates ask about most — each one written by the
          recruiter who works that desk.
        </p>
        <ul className="mt-8 divide-y divide-sand-200 border-y border-sand-200">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/resources/blog/${g.slug}`}
                className="group flex flex-col gap-1 py-5 transition-colors hover:text-brand-700 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="flex-1 text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                  {g.title}
                  <Icon
                    name="arrow-right"
                    className="ml-2 inline h-4 w-4 -translate-y-px text-brand-400 transition-transform group-hover:translate-x-1"
                  />
                </span>
                <span className="flex-1 text-sm leading-relaxed text-slate-600 sm:text-right">{g.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-bold text-ink-900">Tools we recommend</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Free calculators and reference material for the trades we place — useful for contractors pricing work and for
          candidates building their estimating skills.
        </p>
        <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2">
          {externalCards.map((c) => (
            <MotionItem key={c.href} variants={staggerItem}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener"
                className="group flex h-full items-start gap-5 rounded-2xl border border-sand-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={c.icon} className="h-7 w-7" strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-ink-900">
                    {c.title}
                    <Icon name="arrow-up-right" className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                </div>
              </a>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>
    </>
  );
}
