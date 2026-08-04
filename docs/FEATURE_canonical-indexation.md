# Canonicalization & Indexation Hygiene

Fixes surfaced by the SEO audit (2026-08-04), each validated against live
Google Search Console + GA4 data for `www.exzelon.com`.

## Why

The rebuild inherited indexation debt from the original (lost) site and from the
Vercel platform host. Real Google data showed:

- **Legacy `.html` pages still indexed & ranking, now 404.**
  `/engineering.html` (pos 3.2, 13 impressions) and `/defence-aerospace.html`
  (pos 4.1, 12 impressions) were the highest-impression pages after the homepage
  — both return `404`. Ranking signal was leaking to dead URLs.
- **Vercel mirror indexed.** GA4 logged an organic session on
  `exzelon-web.vercel.app`, a full duplicate of the canonical site.
- **Auth pages indexed.** `/login` ranked at pos 6.4 (8 impressions, 1 wasted
  click); `/register` at pos 6.0.
- **Dashboards crawlable.** `/admin`, `/employer`, `/account` had no `Disallow`.

## Changes

| File | Change |
|---|---|
| `next.config.ts` | 301 `engineering.html` & `defence-aerospace.html` → `/opportunities`; catch-all `*.html` → `/`. Added `headers()` emitting `X-Robots-Tag: noindex` for any `*.vercel.app` host. |
| `src/app/robots.ts` | `Disallow` `/admin/`, `/employer/`, `/account/` (kept `/api/`). |
| `src/app/(auth)/layout.tsx` | `robots: { index: false, follow: true }` for all auth pages. |

### Design notes
- Auth pages use **`noindex` (not `robots.txt` Disallow)** so Google can recrawl
  and *drop* the entries already in its index — a Disallow would freeze them in.
- Dashboards use **Disallow** — they are behind auth and should never be indexed,
  so preventing the crawl is correct and saves crawl budget.
- The apex→www canonical redirect and self-referencing `<link rel="canonical">`
  tags (`src/lib/seo.ts` `pageMetadata`) already existed — unchanged.

## Out of scope (tracked separately)
- **`/jobs/demo` 404 in sitemap** — an Atlas data record (the seed demo job), not
  code. Fix: remove/close it in the DB.
- LocalBusiness/EmploymentAgency schema, `llms.txt`, sitemap `lastmod` — content
  PR.

## Verification
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean.
- Post-deploy: `curl -I https://www.exzelon.com/engineering.html` → 301 →
  `/opportunities`; confirm `X-Robots-Tag: noindex` on the `*.vercel.app` host;
  re-inspect `/login` in GSC and request removal of the legacy `.html` URLs.
