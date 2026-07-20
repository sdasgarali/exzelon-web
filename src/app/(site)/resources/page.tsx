import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description: "Compliance, blog, FAQs, and feedback — everything you need to make the most of Exzelon.",
  path: "/resources",
});

const cards = [
  { href: "/resources/blog", icon: "file-text", title: "Blog", desc: "Career and hiring insights from our recruiting team." },
  { href: "/resources/faq", icon: "message-circle", title: "FAQ", desc: "Answers to the most common questions from candidates and clients." },
  { href: "/resources/compliance", icon: "badge-check", title: "Compliance", desc: "How we handle licensing, credentialing, and standards." },
  { href: "/resources/feedback", icon: "star", title: "Feedback", desc: "Share your experience and help us improve." },
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
    </>
  );
}
