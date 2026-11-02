import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { site } from "@/lib/site";
import type { Industry } from "@/content/industries";
import { getIndustryGuide } from "@/content/industry-guides";

/**
 * Sector guide for an /opportunities/<industry> page: field-specific copy for employers and
 * candidates, a `Service` entity for the industry practice, and one internal link to a related
 * guide. Renders nothing when the slug has no guide, so adding a guide is purely additive.
 */
export function IndustryGuide({ industry }: { industry: Industry }) {
  const guide = getIndustryGuide(industry.slug);
  if (!guide) return null;

  const pageUrl = `${site.url}/opportunities/${industry.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${industry.name} staffing`,
    serviceType: `${industry.name} recruitment and staffing`,
    description: industry.short,
    url: pageUrl,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: [
      { "@type": "City", name: "Chicago" },
      { "@type": "State", name: "Illinois" },
      { "@type": "Country", name: "United States" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${industry.name} roles we place`,
      itemListElement: industry.roles.map((role) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Occupation", name: role },
      })),
    },
  };

  const groups = [
    {
      icon: "briefcase",
      title: `Hiring ${industry.name} talent`,
      notes: guide.employerNotes,
    },
    {
      icon: "user-check",
      title: `Looking for a role in ${industry.name}`,
      notes: guide.candidateNotes,
    },
  ];

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SectionHeading eyebrow={`${industry.name} sector guide`} title={guide.heading} description={guide.overview} />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {groups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.1}>
            <div className="flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <Icon name={g.icon} className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{g.title}</h3>
              <ul className="mt-4 space-y-3">
                {g.notes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.2} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {guide.relatedGuide && (
        <p className="mt-10 text-base text-slate-600">
          Related reading:{" "}
          <Link
            href={`/resources/blog/${guide.relatedGuide.slug}`}
            className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
          >
            {guide.relatedGuide.label}
          </Link>
        </p>
      )}
    </Section>
  );
}
