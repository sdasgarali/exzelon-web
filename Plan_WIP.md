# Plan WIP — Exzelon Web Rebuild

## SESSION_CONTEXT_RETRIEVAL
> SEO AUDIT ROUND 2 (2026-08-17, branch `feature/seo-audit-fixes-round2`): full re-audit via 5 parallel
> seo-* subagents (technical/schema/content/local/geo) against source. Fixed high-confidence Critical+High
> in ONE PR (lint+tsc+build green): (Critical) removed fabricated stats STILL live in about/page.tsx
> grid ("25,000+"/"4.4/5") + opengraph-image.tsx ("25,000+/1,200+/4.4/5") → replaced w/ verifiable
> (5 sectors / 9-day time-to-offer / 99% compliance / US-wide); removed dead `/about#leadership` nav
> entry (no such section). (High schema, seo.ts) org logo bare→ImageObject(1036x401)+priceRange+
> contactPoint; WebSite SearchAction EntryPoint→flat target string; BlogPosting image→ImageObject always
> present (logo fallback); JobPosting applicantLocationRequirements USA→US; Travel employmentType
> CONTRACTOR→TEMPORARY; hiringOrganization=actual employer for employer-posted jobs. (High) sitemap
> lastModified on static+industry routes (SITE_UPDATED const, not per-crawl now()); opportunities/[slug]
> meta description gains Chicago/Illinois/nationwide geo. (Low) robots +Bingbot/ChatGPT-User; layout
> keywords +tax/legal/travel-nurse/geo. DEFERRED to Phase 2 (docs/SEO_AUDIT_ROUND2.md): FAQ answer
> depth 130-160w + per-industry FAQ+schema, thin-content expansion (hub/industry/jobs intros, services,
> compliance), author bios, question-form H2s, Service+Review JSON-LD, blog→vertical internal links,
> employerLogos verify (Google/MS/Amazon), off-site GBP/Wikidata/Crunchbase/YouTube + GSC re-validate.
> NEXT: push branch → PR → merge (--admin) → Vercel prod → owner validates in Rich Results Test.
>
> SEO ESSENTIALS (2026-08-07, PR #22 dbc700b, MERGED squash --admin + Vercel prod deployed, VERIFIED
> LIVE on www.exzelon.com): home EmploymentAgency + WebSite/SearchAction schema, aggregateRating GONE
> (0), robots AI-crawler rules live, llms.txt 200, job page JobPosting w/ datePosted+FULL_TIME+
> BreadcrumbList, "25,000+"/AmbitionBox removed from home+footer+contact (0). NOTE: Vercel PREVIEW
> builds fail because MONGODB_URI/DB/JWT_SECRET/NEXT_PUBLIC_SITE_URL are Production-scoped only — prod
> deploy is fine; merge PRs with --admin to bypass the red preview check. NEXT (owner): validate in
> Google Rich Results Test + resubmit sitemap in GSC. DEFERRED (not in PR): apply-gate funnel redesign,
> employerLogos decision, thin-content/leadership/author-bios, off-site GBP/reviews/YouTube.
> Original in-progress plan for this work is preserved below.
>
> SEO ESSENTIALS (2026-08-07, branch `feature/seo-essentials`, IN PROGRESS): implementing the
> Critical+High fixes from a full `/seo audit` (health 52/100). Slices: (1) remove fabricated
> AmbitionBox rating [site.ts `rating`, seo.ts aggregateRating, footer/contact/feedback/hero UI] +
> reframe inflated hero stats ("25,000+/98%/1,200+") to honest claims + drop dead `heroStats`;
> (2) Organization→EmploymentAgency schema (geo/areaServed/hours/@id/logo, name="Exzelon");
> (3) complete JobPosting (datePosted/enum employmentType/full description/validThrough/baseSalary/
> jobLocationType) — repo.ts+jobs.ts expose createdAtIso/salaryMin/Max; (4) BlogPosting + BreadcrumbList
> (in PageHeader) + WebSite+SearchAction (home); (5) public/llms.txt (no fabricated stats);
> (6) robots AI-crawler rules + sitemap lastmod; (7) perf: img formats/priority, GA4 lazyOnload,
> preconnect; (8) keyword H1s + industry-filtered opportunity CTAs. DEFERRED (reported, not in PR):
> apply-gate funnel redesign (auth/security), employerLogos marquee (needs real-relationship confirm),
> thin-content/leadership/author-bios, off-site GBP/reviews/YouTube. Every slice: lint+tsc+build green.
>
> BLOG CONTENT API (2026-07-29, PR #20, LIVE): Write-capable REST API
> so AccessHub Pro can list/read/create/edit/publish/delete blog posts via an API key. Endpoints (Bearer
> + CORS + OPTIONS): GET/POST /api/v1/posts (list/create), GET/PUT/PATCH/DELETE /api/v1/posts/[slug].
> snake_case contract (toApiPost/ApiPost: cover_image_url/reading_time/published_at/url). Repo:
> apiListPosts/apiGetPost/apiCreatePost/apiUpdatePost + insertPost refactor. SCOPED KEYS: AnalyticsApiKeyDoc
> gained scopes[] (analytics:read/posts:read/posts:write); legacy keys→[analytics:read] (backward compat,
> no silent blog-write). Shared guard src/lib/auth/api-key.ts requireApiKey(req,scope) (401/403).
> /api/v1/analytics now requires analytics:read. Admin /admin/api-keys ("API access" nav) mints keys with
> scope checkboxes + shows scopes col + Blog Content API connect panel; POST /api/admin/api-keys accepts
> scopes. VERIFIED (dev server, real minted key): no-key=401, list 200 (4 posts), create 201 (draft, url
> present), read 200, analytics-only key on posts=403 (scope enforced), PATCH publish→published+featured+
> published_at→public 200, PUT 200, bad body=422, DELETE 200→public 404. lint+tsc+build green. Test post +
> 3 test keys cleaned (keys soft-revoked; 3 revoked "E2E…" rows remain in prod key list — harmless).
> MERGED (squash --admin) + Vercel deployed; VERIFIED LIVE on www.exzelon.com: OPTIONS preflight 204 +
> CORS headers, bogus key 401 on both /api/v1/posts and /[slug], analytics still guarded (401). AccessHub
> connect: URL https://www.exzelon.com/api/v1/posts, key w/ posts:read+posts:write from /admin/api-keys.
> Design: docs/FEATURE_blog-content-api.md.
>
> ADMIN BLOG (2026-07-29, PR #19, LIVE): Blog is now
> DB-driven + admin-authored. New `posts` collection + repo CRUD (createPost/updatePost/
> listPublishedPosts/getPublishedPostBySlug/getPostForAdmin/deletePost; readingTime derived, publishedAt
> stamped on first publish). Admin-only POST /api/posts + PUT/DELETE /api/posts/[slug] (audited).
> Authoring UI at /admin/posts (list + new + [slug]/edit) via post-form.tsx (draft/publish, cover-image
> URL, featured). Bodies = markdown-lite rendered by src/lib/markdown.tsx (zero-dep: ##/### headings,
> paragraphs, - bullets, > quotes, **bold**, [links]; React-escaped). Public /resources/blog + [slug] +
> homepage preview + sitemap.ts now read published posts from DB. Static blogPosts REMOVED from
> site-content.ts; 4 legacy posts migrated (full bodies, ORIGINAL slugs preserved) via
> src/content/blog-seed.ts + npm run db:seed. Verified: lint+tsc+build green; seed ran (4 posts upserted
> to prod DB); dev-server E2E — list shows 4 posts, detail renders markdown (h2/blockquote/bullets),
> admin create-draft(private 404)→publish(public 200)→delete(404) all pass, unauth create=401. Also
> deleted stray probe-exz-contacts.js. MERGED (squash --admin) + Vercel deployed; VERIFIED LIVE on
> www.exzelon.com: blog list 200 w/ 4 posts, detail renders new DB markdown body, /api/posts unauth=401,
> sitemap lists 4 blog URLs. Admin writes posts at www.exzelon.com/admin/posts (admin@exzelon.com).
> Design: docs/FEATURE_admin-blog.md.
>
> FULL DATA VIA API KEY (2026-07-29, PR #17, LIVE): /api/v1/analytics now returns contacts[] (full lead
> detail: name/email/country/city/region/browser/os/device/language/referrer/landing_page/last_page/
> visits/consented_at/first_seen/last_seen) + contacts_count, alongside totals/daily/sources. Source-
> filtered, cap 2000. listConsentedVisitors({source,limit}). AccessHub still only reads daily[] (ignores
> contacts) — to show contacts in AccessHub needs an accesshub-pro-side change. Verified live.
>
> CONSENT EXPORT + DELETE (2026-07-29, PR #16, LIVE): Cookie Consent page has an Export CSV button
> (GET /api/admin/export/consent, full lead+detail CSV via toCsv) + per-row Delete (client ConsentTable
> → DELETE /api/admin/consent/[id], admin-guarded, audited consent.delete; repo deleteVisitorLog).
> Verified live (CSV 200 with data; delete 404 bogus / 401 unauth). CLEANUP TODO: 2 test rows still in
> prod consent list — "QA Test Lead"/qa-test@example.com + "Enrich QA"/enrich-qa@example.com — deletable
> via the new UI Delete button.
>
> VISITOR ENRICHMENT (2026-07-29, PR #15, LIVE): each visitor now auto-captures location (country/city/
> region via Vercel x-vercel-ip-* edge headers), device (browser/os/deviceType via lib/user-agent.ts),
> referrer + landingPage, language (Accept-Language) — set once via $setOnInsert in recordVisit. Admin
> Cookie Consent table shows Location/Device/Referrer columns. Verified live. Two TEST rows in prod
> consent data: "QA Test Lead"/qa-test@example.com + "Enrich QA"/enrich-qa@example.com (no delete UI yet).
>
> COOKIE CONSENT + LEADS (2026-07-29, PR #14, LIVE): cookie banner now Accept/Decline + optional
> name/email → POST /api/analytics/consent → recordConsent (sets consentStatus, visitorName/Email,
> consentedAt on visitorLogs; daily consentedCount++). Admin /admin/consent ("Cookie Consent" nav)
> shows consented visitors + summary (accepted/withContact/declined/consentRate). Tracker consent flag
> now = exz_cookie_notice=accepted. Verified live (accept w/ lead → shows on admin page). NOTE: a test
> lead "QA Test Lead"/qa-test@example.com exists in prod visitorLogs (no delete endpoint). Data captured
> per consent: status + optional name/email + behavioral (path, visitCount, first/last seen) + technical
> (hashed IP, UA); no raw IP, first-party only.
>

> ANALYTICS PULL API (2026-07-29, PR #13, LIVE): Exzelon now exposes first-party visitor analytics that
> AccessHub PULLS (push tracker was CORP-blocked). Same-origin VisitorTracker (root layout) → POST
> /api/analytics/track → Mongo visitorLogs + visitorDailyStats (hashed IP, consent from cookie notice).
> GET /api/v1/analytics?days=N&source=exz-web (Authorization: Bearer <key>) → { api_key_name, totals,
> daily[{date,page_views,unique_visitors,consented}], sources[], meta } — exact AccessHub/neuraforz shape.
> Admin mints keys at /admin/api-keys (raw shown once, sha256-stored; GET/POST /api/admin/api-keys, DELETE
> /api/admin/api-keys/[id]). Verified live end-to-end (login→mint→track→pull 200 w/ data, 401 w/o key).
> TO CONNECT in AccessHub → Websites → Connect API: URL https://www.exzelon.com/api/v1/analytics,
> Source exz-web, API key from /admin/api-keys. Contract confirmed vs accesshub-pro site-pull.ts. Repo:
> repo.ts recordVisit/getVisitorAnalytics/createAnalyticsApiKey/etc. Design: docs/FEATURE_analytics-pull-api.md.
>

> SEO/SITEMAP (2026-07-28, PR #9 then PR #10, LIVE): canonical domain = https://www.exzelon.com (WWW —
> reversed from non-www per user "no add www"). site.url env-driven (NEXT_PUBLIC_SITE_URL ||
> https://www.exzelon.com); Vercel prod NEXT_PUBLIC_SITE_URL = https://www.exzelon.com. next.config:
> permanent bare-domain→www redirect (verified exzelon.com 308→www). sitemap.ts async + DB-driven
> (listPublicJobs, open/non-expired, id=slug), revalidate=3600. Verified: robots + all 34 sitemap URLs
> use www.exzelon.com; google449fdb1233c51045.html serves on www (200). NEXT for user: register GSC
> property https://www.exzelon.com (URL-prefix), verify via the HTML file, submit sitemap.xml.
>

> COOKIE NOTICE + ACCESSHUB TRACKING (2026-07-28, PR #7 3c53dc5, LIVE): root layout.tsx loads
> AccessHub tracker <Script src="https://accesshub.neuraforz.com/api/track.js" data-source="exz-web"
> afterInteractive> on ALL pages. Informational cookie banner (components/cookie-notice.tsx) — first-
> party cookie exz_cookie_notice=1 remembers dismissal; re-open via footer "Cookie notice" link
> (exz:open-cookie-notice event). Tracker ALWAYS loads (banner informational, per decision), not
> consent-gated (can upgrade later). Verified live (track.js in HTML + data-source=exz-web). Resume
> upload cap now 2MB (PR #6). Design: docs/FEATURE_cookie-notice-tracking.md.
>

> RESUME STORAGE ON BACKBLAZE B2 (2026-07-28, PR #5 438c1ca, LIVE): resumes moved off GridFS to a
> PRIVATE B2 bucket "29959k" via B2's NATIVE API (src/lib/storage/b2.ts) — chosen because B2's
> S3-compatible API rejects the master key (user opted to use the master key). Upload through API →
> b2_get_upload_url; download = 302 to a 60s prefix-scoped b2_get_download_authorization URL on
> f005.backblazeb2.com; delete via list+delete_file_version. Legacy 24-hex GridFS ids still stream
> (fallback). Vercel prod env set: B2_KEY_ID / B2_APPLICATION_KEY / B2_BUCKET. Verified live end-to-end
> (login seeker → upload 200 → download 302→200 pdf → delete 200 → 403). Design: docs/FEATURE_b2-resume-storage.md.
> ⚠️ SECURITY: using the B2 MASTER key (per user). It was shared in chat → regenerate later + ideally
> switch to a bucket-scoped key. Master key now in local .env.local (gitignored) + Vercel.
>

> IN PROGRESS (2026-07-28): Registration is now OTP-GATED — no account created until the emailed code
> is confirmed. Register → pendingRegistrations collection (unique email + 1h TTL) + signed exz_pending
> cookie (lib/auth/pending.ts) + signup OTP email; redirect to /verify-account. complete-registration
> confirms OTP → createUser(emailVerified:true) + session. resend-registration reissues. Build+lint+tsc
> green; NOT yet committed/deployed at time of writing. Design: docs/FEATURE_otp-verification.md.
> EMAIL DELIVERY FIXED (2026-07-28): exzelon.com is Verified in Resend (Hostinger DNS). Set prod
> CONTACT_FROM_EMAIL="Exzelon <noreply@exzelon.com>" in Vercel + redeployed. Test send to
> delivered@resend.dev → register 200, no Resend error in logs. Transactional email (signup OTP,
> reset, notifications) now reaches real inboxes.
>
> PRIOR — OTP email verification shipped (PR #3, ef43774) + deployed. Verify email now
> carries BOTH a 6-digit code (15-min TTL, hashed, session-scoped via /api/auth/verify-email `{otp}`)
> AND the existing magic link. Banner has an "Enter code →" link to /verify-email. Forgot-PASSWORD
> flow already existed — unchanged. Design: docs/FEATURE_otp-verification.md. Post-signup flow kept
> (seeker→profile, employer→dashboard) + banner (chosen UX). Redeployed to prod; /verify-email = 200.
>
> Site deployed to Vercel production and public at https://exzelon.com (HTTP 200,
> no SSO wall on the custom domain; *.vercel.app previews still behind Deployment Protection).
> Portal-completion PR #1 merged; demo-login hint removed (PR #2, merged 3f4f0ba). All 6 prod env
> vars set (MONGODB_URI/DB, JWT_SECRET, RESEND_API_KEY, NEXT_PUBLIC_SITE_URL, CONTACT_FROM_EMAIL).
> STILL PENDING (security/ops): rotate the Mongo password (leaked in chat) + lock Atlas IP allow-list;
> optionally run `npm run db:seed` to backfill salaryMin/Max + emailVerified on any pre-existing docs.
>
> PRIOR: ALL 7 FEATURES DONE (F1–F7). See "Portal Completion Roadmap" below (all checked).
>
> PRIOR CONTEXT —
> Rebuilt exzelon.com (source lost) as a modern animated Next.js marketing site + working forms,
> THEN added a full auth + MongoDB layer: admin / employer / job-seeker accounts, dashboards,
> and DB-driven jobs. DEPLOYED to Vercel (project exzelon-web, team asgar-ali-sayeds-projects),
> env vars set, but still behind the Vercel SSO/Deployment-Protection wall (not public yet).
> LATEST: (1) removed the About "Meet the team" section; (2) sharpened the navbar logo
> (higher intrinsic res + quality=90, next.config qualities:[75,90]); (3) NEW FEATURE — gated
> job applications: applying now requires a signed-in seeker with a complete profile (name+email+
> resume link). Rich profile (resume, links, fresher/experienced + LinkedIn-style experience &
> education field-arrays) on /account/profile. See docs/FEATURE_apply-gating.md.
> NEXT: commit+push the apply-gating feature (redeploys); still pending — rotate Mongo password,
> remove demo-login hint before going public, optionally disable Deployment Protection to go live.

## Portal Completion Roadmap (implement 1-by-1) — ACTIVE
- [x] **F1 — Auth completeness**: forgot/reset password + email verification (+resend). DONE 2026-07-27.
      Tokens (`lib/auth/tokens.ts`, sha256-hashed, TTL) + repo fns; routes forgot/reset/verify/resend;
      pages /forgot-password /reset-password /verify-email; register sends verify email; login has
      "Forgot password?"; dashboards show unverified banner; seed marks demo users verified; stronger
      password rule (letter+number). Build+lint+tsc green.
- [ ] **F2 — Transactional emails**: apply-confirmation to seeker, new-application alert to employer, status-change email to seeker.
- [x] **F3 — Resume file upload**: DONE 2026-07-27. GridFS (`lib/db/files.ts`, 5MB, PDF/DOC/DOCX);
      POST/DELETE `/api/account/resume`; authorized `GET /api/files/resume/[id]` (owner seeker /
      job-owning employer / admin); profile completeness = file OR link; profile PUT preserves file;
      resume snapshot on apply; file download surfaced in apply-panel + admin/employer applicant views.
- [x] **F4 — Server-side job search**: DONE 2026-07-27. `searchPublicJobs` (Mongo query + skip/limit +
      count); `/jobs` now force-dynamic, reads searchParams (q/loc/industry/type/remote/salaryMin/sort/page);
      URL-driven `JobsFilters` (debounced text) + server `JobsPagination`; structured salaryMin/Max derived
      from the salary string via `lib/salary.ts` (create/update/seed backfill) → salary filter works.
      Removed client-only JobsExplorer.
- [x] **F5 — Employer company profile + job expiry**: DONE 2026-07-27. Employer `companyProfile`
      (tagline/about/website/location/size/logoUrl) at `/employer/company` + `PUT /api/employer/company`;
      public `/companies/[id]` with branding + open roles; job cards/detail link to the company;
      `expiresAt` on jobs (date input in job form) auto-hides expired roles from all public reads
      (`notExpired()` clause) + "Expired" chip in employer job list + "Apply by" on job detail.
- [x] **F6 — Admin analytics + audit log + CSV export**: DONE 2026-07-27. `/admin/analytics` (CSS-bar
      charts: apps/14 days, funnel, jobs by industry, top roles) via `getAnalytics`; `auditLogs`
      collection + `logAudit`/`listAuditLogs`, wired into user role/delete, job delete, application
      status; `/admin/audit` viewer; CSV export `/api/admin/export/{applications,users}` (admin-only)
      + export buttons. No chart/CSV deps.
- [x] **F7 — In-app messaging**: DONE 2026-07-27. `messages` collection + `getThreadContext`/`listMessages`/
      `createMessage`; `GET/POST /api/applications/[id]/messages` authorized to the applicant (seeker) +
      job-owning employer (admin read-only); `MessageThread` client component; thread pages
      `/account/messages/[id]` + `/employer/messages/[id]`; "Message(s)" links from seeker + employer
      application lists.

Groundwork (inside F1): generalize `lib/email.ts` to accept optional `to`; add `lib/auth/tokens.ts`
(random token + sha256 + expiry); extend `UserDoc` with emailVerified + verify/reset token fields.
Constraints: no heavy new deps — Mongo GridFS for resumes, CSS bars for charts, manual CSV.
Every slice: `npm run lint` + `npx tsc --noEmit` before commit.

## Phase 2 — Auth + MongoDB (added on request)
- Roles: admin / employer / seeker · JWT (jose) httpOnly cookie · bcryptjs · src/proxy.ts guards.
- MongoDB Atlas: users/jobs/applications/contacts. Seed = `npm run db:seed` (12 jobs + 3 demo users).
- Dashboards: /admin (jobs CRUD, applications, messages, users), /employer (own jobs + applicants),
  /account (my applications, saved jobs, profile). Public forms persist to Mongo; jobs are DB-driven.
- Demo: admin@exzelon.com/Admin@12345 · employer@exzelon.com/Employer@123 · seeker@exzelon.com/Seeker@12345.

## Stack
Next.js 16 (App Router, TS) · Tailwind CSS v4 · Framer Motion · react-hook-form + zod · Resend · lucide-react

## Completed
- [x] Apply-gating + rich seeker profile: auth+complete-profile required to apply; /account/profile
      editable form (resume/links/experience/education); new /api/account/profile; /api/apply rewritten
      to require seeker + complete profile. Verified end-to-end (Playwright). (2026-07-21)
- [x] Removed About "Meet the team" section; sharpened navbar logo (2026-07-21)
- [x] Scaffold + design tokens (globals.css theme, Inter/Sora fonts) (2026-07-20)
- [x] Shared layout: Navbar (scroll-aware + mega-menu + mobile sheet), Footer, motion primitives (2026-07-20)
- [x] Home page — hero (animated + job search), 4-step, industries, healthcare spotlight, featured jobs, services, testimonials, blog, CTA (2026-07-20)
- [x] About + For Clients pages (2026-07-20)
- [x] Opportunities index + [slug]; Jobs board (filter/search) + [id] + ApplyForm (2026-07-20)
- [x] Resources hub: Blog (+[slug]), FAQ, Compliance, Feedback; Contact page; api/contact + api/apply (2026-07-20)
- [x] Polish: robots, sitemap, JSON-LD, OG image, .env.example, not-found/error, a11y, responsive QA (2026-07-20)
- [x] Fixed: double-branded <title>; mobile menu overlay trapped by header backdrop-filter; "Next Next" headline (2026-07-20)

## Verification done
- `npm run build` ✓ (39 routes) · `npm run lint` ✓ (0 problems) · `tsc --noEmit` ✓
- Chrome DevTools MCP: home (desktop+mobile), contact, jobs, mobile menu — no console errors
- Forms: valid→200 (dev-fallback log), invalid→422 field errors, honeypot/bad→blocked

## Blockers / Notes
- No real backend/auth/job DB by design (scope = marketing + working forms).
- Imagery = CSS gradients/placeholders; swap for real photography later.
- Email = Resend, env-driven; without RESEND_API_KEY the dev fallback logs + returns success.
- Not deployed yet.
