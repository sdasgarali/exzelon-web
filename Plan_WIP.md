# Plan WIP — Exzelon Web Rebuild

## SESSION_CONTEXT_RETRIEVAL
> Rebuilt exzelon.com (source lost) as a modern animated Next.js marketing site + working forms,
> THEN added a full auth + MongoDB layer: admin / employer / job-seeker accounts, dashboards,
> and DB-driven jobs. Build + lint + typecheck green (46+ routes). Browser-verified end-to-end:
> login→admin dashboard, middleware guards, contact form → MongoDB → admin Messages round-trip.
> NEXT: rotate the Mongo password in Atlas (shared once in chat); optionally add real RESEND_API_KEY
> + photography; deploy to VPS per ~/.claude/CLAUDE_REFERENCE/vps-deployment.md.

## Phase 2 — Auth + MongoDB (added on request)
- Roles: admin / employer / seeker · JWT (jose) httpOnly cookie · bcryptjs · src/proxy.ts guards.
- MongoDB Atlas: users/jobs/applications/contacts. Seed = `npm run db:seed` (12 jobs + 3 demo users).
- Dashboards: /admin (jobs CRUD, applications, messages, users), /employer (own jobs + applicants),
  /account (my applications, saved jobs, profile). Public forms persist to Mongo; jobs are DB-driven.
- Demo: admin@exzelon.com/Admin@12345 · employer@exzelon.com/Employer@123 · seeker@exzelon.com/Seeker@12345.

## Stack
Next.js 16 (App Router, TS) · Tailwind CSS v4 · Framer Motion · react-hook-form + zod · Resend · lucide-react

## Completed
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
