import type { Metadata } from "next";
import { site } from "./site";
import type { Job } from "@/content/jobs";

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

const ORG_ID = `${site.url}/#organization`;
const LOGO_URL = `${site.url}/brand/exzelon-logo.png`;
// Intrinsic pixels of public/brand/exzelon-logo.png — lets Google size-validate the asset.
const LOGO_OBJECT = { "@type": "ImageObject", url: LOGO_URL, width: 1036, height: 401 } as const;

/**
 * Primary entity JSON-LD. Typed as `EmploymentAgency` (a LocalBusiness subtype) —
 * semantically precise for a recruitment/staffing firm and eligible for local
 * results, unlike the generic `Organization`.
 *
 * NOTE: no `aggregateRating` is emitted. A self-asserted rating sourced off-site
 * (the old "4.4 on AmbitionBox") violates Google's structured-data policy and can
 * trigger a manual action. Re-add only with genuine, on-site, verifiable reviews.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.brand,
    url: site.url,
    logo: LOGO_OBJECT,
    image: LOGO_URL,
    email: site.email,
    telephone: site.phone,
    priceRange: "$$",
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      addressRegion: site.address.stateCode,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.address.lat,
      longitude: site.address.lng,
    },
    areaServed: [
      { "@type": "City", name: "Chicago" },
      { "@type": "State", name: "Illinois" },
      { "@type": "Country", name: "United States" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phoneHref.replace("tel:", ""),
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    },
    sameAs: site.socials.map((s) => s.href),
  };
}

/** WebSite + SearchAction — enables the sitelinks search box (home page only). */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      // Google's Sitelinks Searchbox spec expects a flat URL template, not an EntryPoint object.
      target: `${site.url}/jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList from a page's crumb trail. `crumbs` is the same array passed to
 * `PageHeader` (each entry a `{ label, href? }`, the last being the current page
 * with no href). "Home" is prepended automatically.
 */
export function breadcrumbJsonLd(crumbs: { label: string; href?: string }[]) {
  const items = [{ label: "Home", href: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      // `item` is optional for the final (current-page) entry per Google's spec.
      ...(c.href ? { item: `${site.url}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };
}

/** BlogPosting JSON-LD for a published post (fields come from the serialized PostDoc). */
export function blogPostingJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
  coverImageUrl?: string;
}) {
  const url = `${site.url}/resources/blog/${post.slug}`;
  const published = post.publishedAt ?? post.createdAt;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    ...(published ? { datePublished: published } : {}),
    ...(post.updatedAt || published ? { dateModified: post.updatedAt ?? published } : {}),
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: site.name,
      logo: LOGO_OBJECT,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    // Always emit an image so the post stays eligible for the Article rich result;
    // fall back to the org logo when the post has no cover.
    image: post.coverImageUrl
      ? { "@type": "ImageObject", url: post.coverImageUrl, width: 1200, height: 630 }
      : LOGO_OBJECT,
    url,
  };
}

/** Google's JobPosting `employmentType` enum, mapped from our internal type labels. */
const EMPLOYMENT_TYPE: Record<Job["type"], string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACTOR",
  "Temp-to-hire": "TEMPORARY",
  // Travel assignments are fixed-term, location-variable — TEMPORARY, not CONTRACTOR.
  Travel: "TEMPORARY",
};

/**
 * Derive schema `baseSalary` straight from the human salary string so the unit is
 * correct (the annualized `salaryMin/Max` used for filtering mislabels weekly/hourly
 * pay). Returns null when no numbers are present ("Competitive", etc.).
 */
function salaryForSchema(salary: string): { min: number; max: number; unit: string } | null {
  const text = salary.toLowerCase();
  const unit = /\/\s*(hr|hour)|per hour|hourly/.test(text)
    ? "HOUR"
    : /\/\s*(wk|week)/.test(text)
      ? "WEEK"
      : /\/\s*(mo|month)/.test(text)
        ? "MONTH"
        : "YEAR";
  const nums: number[] = [];
  for (const m of text.matchAll(/(\d[\d,]*\.?\d*)\s*(k)?/g)) {
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n)) continue;
    if (m[2] === "k") n *= 1000;
    nums.push(Math.round(n));
  }
  if (nums.length === 0) return null;
  return { min: Math.min(...nums), max: Math.max(...nums), unit };
}

/**
 * JobPosting JSON-LD for a job detail page. Includes every field Google requires
 * (`datePosted`, full `description`, enum `employmentType`) plus recommended ones
 * (`validThrough`, `baseSalary`, `jobLocationType`) so the role is eligible for the
 * Google Jobs rich result.
 */
export function jobPostingJsonLd(job: Job) {
  const [locality, region] = job.location.split(",").map((s) => s.trim());
  const pay = salaryForSchema(job.salary);
  const list = (items: string[]) =>
    items.length ? `<ul>${items.map((r) => `<li>${r}</li>`).join("")}</ul>` : "";
  const description =
    `<p>${job.summary}</p>` +
    (job.responsibilities.length ? `<p><strong>Responsibilities</strong></p>${list(job.responsibilities)}` : "") +
    (job.requirements.length ? `<p><strong>Requirements</strong></p>${list(job.requirements)}` : "");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    ...(job.createdAtIso ? { datePosted: job.createdAtIso } : {}),
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    employmentType: EMPLOYMENT_TYPE[job.type] ?? "OTHER",
    // Employer-posted roles name the actual employer; Exzelon-posted/seed roles name Exzelon
    // (the agency) and link to the org entity.
    hiringOrganization: job.companyId
      ? { "@type": "Organization", name: job.company ?? site.name }
      : { "@type": "Organization", "@id": ORG_ID, name: site.name, sameAs: site.url },
    identifier: { "@type": "PropertyValue", name: site.name, value: job.id },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(locality ? { addressLocality: locality } : {}),
        ...(region ? { addressRegion: region } : {}),
        addressCountry: "US",
      },
    },
    ...(job.remote === "Remote"
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: { "@type": "Country", name: "US" },
        }
      : {}),
    ...(pay
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              minValue: pay.min,
              maxValue: pay.max,
              unitText: pay.unit,
            },
          },
        }
      : {}),
    industry: job.industryName,
    directApply: true,
  };
}
