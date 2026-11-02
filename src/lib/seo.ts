import type { Metadata } from "next";
import { site, jobsEnabled } from "./site";
import type { Job } from "@/content/jobs";

type PageSeo = {
  title?: string;
  description?: string;
  path?: string;
  /** Emit `title` as `{ absolute }` — skips the root layout's "%s | brand" template. */
  absoluteTitle?: boolean;
  /** Set for article surfaces (blog posts) so OG carries `article` + timestamps. */
  article?: { publishedTime?: string; modifiedTime?: string };
};

/**
 * Social/AI preview card. Served by the `app/opengraph-image.tsx` file convention —
 * referencing it explicitly is required because setting `openGraph` in page metadata
 * suppresses the file-convention image for that route (only the home page, which sets
 * no `openGraph`, was emitting one).
 */
const OG_IMAGE = `${site.url}/opengraph-image`;
const ogImages = (alt: string) => [{ url: OG_IMAGE, width: 1200, height: 630, alt }];

/**
 * Google truncates SERP titles at roughly 60 characters and descriptions at roughly
 * 155, measured in pixels. Blog post titles/descriptions come straight from the DB,
 * and 9 of the 22 live posts overflowed — Google was cutting them mid-word with its
 * own ellipsis. Trim on a sentence (or word) boundary instead so the snippet ends
 * where we decide it does.
 */
const SERP_TITLE_MAX = 60;
const SERP_DESC_MAX = 155;

/** Words that read badly as the last word of a trimmed title/snippet. */
const DANGLING_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "at", "by", "with", "from",
  "into", "over", "as", "is", "are", "it", "its", "your", "our", "this", "that", "why", "how",
  "what", "when", "which",
]);

const TRAILING_JUNK = /[\s,;:.\-—]+$/;

/**
 * Trim to `max` chars on the cleanest boundary available: a sentence end, then a phrase
 * break (colon / dash / pipe), then a word boundary with dangling words removed.
 */
function clampForSerp(text: string, max: number): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max);

  // A sentence end that keeps most of the budget ends the snippet properly.
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (sentenceEnd >= max * 0.5) return window.slice(0, sentenceEnd + 1);

  // Otherwise drop a whole trailing clause instead of half of one.
  const phraseEnd = Math.max(window.lastIndexOf(": "), window.lastIndexOf(" — "));
  if (phraseEnd >= max * 0.6) return window.slice(0, phraseEnd);

  const wordEnd = window.lastIndexOf(" ");
  let cut = window.slice(0, wordEnd > 0 ? wordEnd : max).replace(TRAILING_JUNK, "");
  // An unclosed bracket ("… AI (and Why It") is worse than a shorter cut.
  const openParen = cut.lastIndexOf("(");
  if (openParen > 0 && cut.indexOf(")", openParen) === -1) {
    cut = cut.slice(0, openParen).replace(TRAILING_JUNK, "");
  }
  const words = cut.split(" ");
  while (words.length > 3 && DANGLING_WORDS.has(words[words.length - 1].toLowerCase())) words.pop();
  return `${words.join(" ")}…`;
}

/**
 * <title> for a page: brand a title when the brand still fits the SERP budget, drop the
 * brand when it does not. A title that is too long on its own is left intact — Google
 * cuts those at a word boundary itself, and truncating editorial titles in code would
 * silently rewrite the owner's copy.
 */
function serpTitle(title: string): string {
  const branded = `${title} | ${site.brand}`;
  return branded.length <= SERP_TITLE_MAX ? branded : title;
}

/**
 * Meta description clamped to the SERP budget. For pages that set their own metadata
 * outside `pageMetadata` (the root layout's site-wide description), so every indexable
 * page is capped the same way.
 */
export function serpDescription(text: string): string {
  return clampForSerp(text, SERP_DESC_MAX);
}

/** Build page-level metadata consistently across routes. */
export function pageMetadata({
  title,
  description,
  path = "/",
  absoluteTitle = false,
  article,
}: PageSeo = {}): Metadata {
  const fullTitle = title ? `${title} | ${site.brand}` : `${site.brand} — ${site.tagline}`;
  const desc = clampForSerp(description ?? site.description, SERP_DESC_MAX);
  const url = `${site.url}${path}`;
  return {
    title: title ? { absolute: absoluteTitle ? title : serpTitle(title) } : undefined,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: site.brand,
      ...(article
        ? {
            type: "article" as const,
            ...(article.publishedTime ? { publishedTime: article.publishedTime } : {}),
            ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
          }
        : { type: "website" as const }),
      locale: "en_US",
      images: ogImages(fullTitle),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [OG_IMAGE],
    },
  };
}

/**
 * Metadata for a blog article. Same shape as `pageMetadata` plus `og:type=article`
 * with its published/modified times, and a `<title>` that keeps the brand suffix only
 * when the whole headline still fits the ~60-character SERP limit — appending
 * " | Exzelon — NextGen Hires" to an editorial headline pushed 20 of 22 posts past it.
 */
export function articleMetadata({
  title,
  description,
  path,
  author,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  author?: string;
  publishedTime?: string | null;
  modifiedTime?: string;
}): Metadata {
  const withBrand = `${title} | ${site.brand}`;
  const withShortBrand = `${title} | ${site.shortName}`;
  const headline =
    withBrand.length <= 60 ? withBrand : withShortBrand.length <= 60 ? withShortBrand : title;
  const url = `${site.url}${path}`;
  return {
    title: { absolute: headline },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: headline,
      description,
      url,
      siteName: site.brand,
      locale: "en_US",
      images: ogImages(headline),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(author ? { authors: [author] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description,
      images: [OG_IMAGE],
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

/**
 * WebSite ± SearchAction (home page only). The sitelinks searchbox is only declared
 * while the public jobs board is enabled: `/jobs` currently 307s to /contact, and a
 * SearchAction whose target does not return search results invalidates the entity.
 */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { "@id": ORG_ID },
    // The SearchAction target must be a live, indexable search URL. While the public
    // jobs board is off, /jobs?q=… 307s to /contact, so advertising it as a search
    // endpoint sends Google a redirect instead of results — omit the action until the
    // board (and its ?q= handler) is back on.
    ...(jobsEnabled
      ? {
          potentialAction: {
            "@type": "SearchAction",
            // Google's Sitelinks Searchbox spec expects a flat URL template, not an EntryPoint object.
            target: `${site.url}/jobs?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
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

/** `YYYY-MM-DD`, `days` from now (UTC). Used for the rolling JobPosting expiry. */
function isoDateInDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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
    // Google recommends `validThrough` and drops/downranks postings without it. Open
    // roles rarely carry an explicit `expiresAt`, so fall back to a rolling 90-day
    // window that always resolves to a future date (refreshed on each ISR render),
    // keeping the listing eligible for as long as it stays live on the site.
    validThrough: job.expiresAt ?? isoDateInDays(90),
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
