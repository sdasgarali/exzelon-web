# Exzelon Web — Project Guide

Modern rebuild of **exzelon.com** (brand: *Exzelon — NextGen Hires*), a Chicago recruitment &
staffing job portal. The original source was lost; this is a full rebuild — a modern, animated
marketing site **+ working Contact/Apply forms**. No user accounts, auth, or live job DB.

> Read this file + `Plan_WIP.md` at session start. Global rules: `~/.claude/CLAUDE.md`.

## Commands
```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # eslint (must be 0 problems)
npm run db:seed  # seed MongoDB: 12 jobs + demo admin/employer/seeker accounts
npx tsc --noEmit # typecheck
```

## Stack
Next.js 16 (App Router, TypeScript, `src/`) · Tailwind CSS v4 · Framer Motion ·
react-hook-form + zod · Resend (email) · **MongoDB (Atlas)** · **custom JWT auth (jose) + bcryptjs** ·
lucide-react · Inter + Sora fonts.

## Auth & database (admin / employer / job-seeker accounts)
- **Roles:** `admin` · `employer` · `seeker`. Session = signed JWT (`jose`) in an httpOnly cookie.
- **`src/proxy.ts`** (Next 16 middleware convention) guards `/admin`, `/employer`, `/account` and
  bounces wrong-role/anon users. Each dashboard layout re-checks the role server-side (defense in depth).
- **Auth code:** `src/lib/auth/` — `jwt.ts` (edge-safe sign/verify, imported by proxy), `session.ts`
  (cookie helpers, `getCurrentUser`), `password.ts` (bcrypt), `api-guard.ts` (`requireApiUser(roles)`).
- **DB:** `src/lib/db/` — `mongodb.ts` (cached client), `models.ts` (collections + `serialize`),
  `repo.ts` (ALL queries — users/jobs/applications/contacts + public-job mappers). Collections:
  `users`, `jobs`, `applications`, `contacts`.
- **Jobs are DB-driven:** public `/jobs`, `/jobs/[id]`, home featured, and opportunity pages read from
  Mongo (ISR `revalidate`). The seed migrates the static `content/jobs.ts` into the DB.
- **Env:** `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET` in `.env.local` (gitignored). See `.env.example`.
  ⚠️ The Mongo password was shared in chat once — rotate it in Atlas and lock the IP allow-list.
- **Demo logins** (from seed): `admin@exzelon.com`/`Admin@12345`, `employer@exzelon.com`/`Employer@123`,
  `seeker@exzelon.com`/`Seeker@12345`. The login page lists these — remove that hint before production.

## Route groups
- `(site)/` — marketing pages, owns the public Navbar/Footer.
- `(auth)/` — `/login`, `/register` (no marketing chrome).
- `/admin`, `/employer`, `/account` — dashboards with their own `DashboardShell` (sidebar).
- Root `layout.tsx` is minimal (html/body + JSON-LD); each group supplies its own frame.

## Architecture
- **Design system** — `src/app/globals.css`: `@theme` brand tokens (brand/ink/accent/sand ramps),
  fluid type (`.display-1/2`), utilities (`.container-x`, `.text-gradient`, `.bg-grid`), keyframes.
  Global `prefers-reduced-motion` guard. Brand = deep navy + electric blue + amber accent.
- **Content is data-driven** — all copy lives in `src/content/` (`industries.ts`, `services.ts`,
  `jobs.ts`, `site-content.ts`). Pages/components are declarative over this data. Edit content here.
- **Config** — `src/lib/site.ts` (brand, contact, nav), `src/lib/seo.ts` (metadata + JSON-LD).
- **UI primitives** — `src/components/ui/` (`button`, `section`, `field`, `icon`). `Icon` maps string
  keys → lucide icons; brand/social glyphs are inline SVGs (lucide dropped them).
- **Motion** — `src/components/motion/`: `Reveal` (scroll fade/slide), `StaggerGroup` + `MotionItem`
  (staggered grids), `Counter` (count-up). All respect reduced motion.
- **Shared components** — `navbar`, `footer`, `page-header`, `cta-banner`, cards (`cards/`),
  `logo`, `logo-marquee`, `testimonials-carousel`, `faq-accordion`.

## Routes
`/` · `/about` · `/for-clients` · `/opportunities` (+`/[slug]`) · `/jobs` (+`/[id]`) ·
`/resources` (+`/blog`,`/blog/[slug]`,`/faq`,`/compliance`,`/feedback`) · `/contact` ·
`robots.ts` · `sitemap.ts` · `opengraph-image.tsx` · `not-found`/`error`.

## Forms (the "working" part)
- Client: `components/forms/{contact,apply}-form.tsx` — react-hook-form + zod, inline errors, honeypot.
- API: `app/api/{contact,apply}/route.ts` — zod re-validation, per-IP rate limit
  (`lib/rate-limit.ts`), email via `lib/email.ts`.
- **Email is env-driven**: with `RESEND_API_KEY` it sends via Resend; without it, the dev fallback
  logs the payload to the server console and returns success so the UX is testable. See `.env.example`.

## Conventions
- Keep content in `src/content/`, not hardcoded in pages.
- Every new animated block must degrade under `prefers-reduced-motion` (use the motion primitives).
- Any `position: fixed` overlay must NOT be nested inside an element with `backdrop-filter`/`filter`
  (creates a containing block). The mobile menu is rendered as a sibling of `<header>` for this reason.
- `pageMetadata()` returns the **bare** page title — the root layout's `title.template` adds the brand.
  Do not append the brand in the helper (double-branding).
- Run `npm run lint` + `npm run build` before marking work done (React 19 lint bans sync setState in effects).

## Brand assets
- Real logo lives in `public/brand/`: `exzelon-logo{,-white}.png` (full) + `exzelon-mark{,-white}.png`
  (square). White variants are for dark/periwinkle surfaces. Regenerate from source via
  `py -3 scripts/process_logo.py` (flood-fill bg removal, preserves the inner arrow cut-out).
- `<Logo invert>` / `<LogoMark>` in `src/components/logo.tsx`. Navbar swaps variant by scroll state.
- Favicon: `src/app/icon.png` (generated from the mark).
- **Design guardrails (impeccable):** no gradient-clip text (the `.text-gradient` utility is now a
  solid amber highlight), no per-section uppercase eyebrows, no hero big-number stat-card template.
  The home hero is a committed-periwinkle composition with a live job-card stack.

## Not done / future
- Real photography for interior sections (hero uses a live product visual, not stock).
- VPS deploy — see `~/.claude/CLAUDE_REFERENCE/vps-deployment.md` (check free ports first).
