# Plan WIP — Exzelon Web Rebuild

## SESSION_CONTEXT_RETRIEVAL
> ACTIVE WORK (2026-07-27): Portal-completion roadmap on branch `feature/portal-completion`.
> Closing the 7-tier gap analysis, one feature per slice, committing after each. See "Portal
> Completion Roadmap" below. Currently: starting F1 (auth completeness).
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
- [ ] **F5 — Employer company profile + job expiry**: public company page, employer branding fields, `expiresAt` auto-close.
- [ ] **F6 — Admin analytics + audit log + CSV export**: charts on dashboard, audit trail collection + viewer, export endpoints.
- [ ] **F7 — In-app messaging**: application-scoped threads employer <-> seeker.

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
