# SEO Audit — Round 2 (2026-08-17)

Full re-audit of https://www.exzelon.com after the Round-1 essentials (PRs #21/#22).
Fan-out: seo-technical · seo-schema · seo-content · seo-local · seo-geo (source-driven, Next.js 16).

## Fixed in this PR (high-confidence Critical + High + cheap wins)

- [x] **CRITICAL — Fabricated stats still live.** `about/page.tsx` stat grid ("25,000+ careers",
      "4.4/5 rating") + `opengraph-image.tsx` ("25,000+ opportunities · 1,200+ employers · 4.4/5 rated").
      Replaced with verifiable/structural claims (5 specialist sectors, 9-day avg time-to-offer,
      99% compliance pass rate, US-wide network; OG: Chicago & US-wide · 5 sectors · compliance-first).
- [x] **CRITICAL — Dead leadership nav anchor.** `site.ts` nav linked `/about#leadership` with no such
      section. Removed the nav entry (no real named leadership to publish).
- [x] **HIGH — Org `logo` bare string → `ImageObject`** (1036×401) in `organizationJsonLd()`.
- [x] **HIGH — WebSite `SearchAction.target` `EntryPoint` object → flat URL string** (Google spec).
- [x] **HIGH — BlogPosting `image` bare string → `ImageObject`, always present** (logo fallback so
      text-only posts stay Article-eligible).
- [x] **HIGH — JobPosting `applicantLocationRequirements.name` "USA" → "US"** (ISO alpha-2).
- [x] **HIGH — Employment type: `Travel` mapped `CONTRACTOR` → `TEMPORARY`** (correct Google enum semantics).
- [x] **HIGH — Sitemap freshness.** Added `lastModified` to static + industry routes (stable
      `SITE_UPDATED` constant, bumped on content change — not a per-crawl `now()`).
- [x] **HIGH — Geo modifiers on industry pages.** `opportunities/[slug]` metadata description now names
      Chicago / Illinois / nationwide.
- [x] **MEDIUM — JobPosting `hiringOrganization`** references the actual employer for employer-posted
      roles (Exzelon only for Exzelon-posted).
- [x] **MEDIUM — Org `contactPoint` + `priceRange`** added to `organizationJsonLd()`.
- [x] **MEDIUM — `layout.tsx` keywords** gained tax & legal + per-vertical geo terms.
- [x] **LOW — robots.txt** adds explicit `Bingbot` + `ChatGPT-User` allow rules.

## Deferred — content depth & off-site (Phase 2, documented not implemented)

These are substantial copywriting / off-site efforts, tracked for the owner:

- Expand FAQ answers to 130–160 words each; add per-industry FAQ blocks + scoped `FAQPage` JSON-LD.
- Expand thin content: `/opportunities` hub intro, each industry `description` (→130–160 words),
  `/jobs` intro copy, service descriptions in `services.ts`, compliance page depth.
- Author bios + `author.url`/`sameAs` on blog posts (E-E-A-T).
- Question-form H2s on for-clients + industry pages (AI-citation).
- `Service` + `Review` JSON-LD (for-clients + homepage testimonials, no aggregateRating).
- Internal links from blog posts → vertical opportunity pages.
- `employerLogos` marquee (Google/Microsoft/Amazon) — verify real relationships or replace/remove.
- Off-site: claim GBP (category = Employment agency, NAP match), Wikidata entity, Crunchbase/
  Glassdoor/Indeed profiles → add to `sameAs`; YouTube channel; owner: GSC Rich Results re-validate.
