import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui/section";
import { FaqAccordion } from "@/components/faq-accordion";
import { CtaBanner } from "@/components/cta-banner";
import { faqs } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Frequently asked questions from job seekers and employers about working with Exzelon.",
  path: "/resources/faq",
});

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        eyebrow="FAQ"
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "FAQ" }]}
        title={<>Frequently asked <span className="text-gradient">questions</span></>}
        description="Everything candidates and employers commonly ask. Still stuck? Reach out any time."
        align="center"
      />
      <Section>
        <FaqAccordion />
      </Section>
      <CtaBanner
        title="Still have questions?"
        subtitle="Our team is happy to help — reach out and we'll get back to you within one business day."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Browse Jobs", href: "/jobs" }}
      />
    </>
  );
}
