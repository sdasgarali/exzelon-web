import type { Metadata } from "next";
import { site } from "./site";

type PageSeo = {
  title?: string;
  description?: string;
  path?: string;
};

/** Build page-level metadata consistently across routes. */
export function pageMetadata({ title, description, path = "/" }: PageSeo = {}): Metadata {
  // Bare page title — the root layout's title.template appends the brand,
  // so we must NOT append it here (would double-brand the tab title).
  const fullTitle = title ? `${title} | ${site.brand}` : `${site.brand} — ${site.tagline}`;
  const desc = description ?? site.description;
  const url = `${site.url}${path}`;
  return {
    title: title ?? undefined,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: site.brand,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}

/** Organization JSON-LD for rich results. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating.score,
      bestRating: site.rating.outOf,
      ratingCount: 320,
    },
    sameAs: site.socials.map((s) => s.href),
  };
}
