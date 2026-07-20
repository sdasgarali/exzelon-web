# Exzelon — NextGen Hires

A modern, fully animated rebuild of [exzelon.com](https://www.exzelon.com) — a Chicago-based
recruitment & staffing job portal serving **healthcare, construction, electrical, tax & legal,
and IT**. Marketing site **+ working Contact and Job-Application forms**.

## Tech stack
- **Next.js 16** (App Router, TypeScript, `src/`)
- **Tailwind CSS v4** with a custom design-token theme
- **Framer Motion** for animation (all motion respects `prefers-reduced-motion`)
- **react-hook-form + zod** for forms & validation
- **Resend** for transactional email (env-driven, with a dev fallback)
- **lucide-react** icons · Inter + Sora fonts

## Getting started
```bash
npm install
cp .env.example .env.local   # optional — forms work without it (dev fallback)
npm run dev                  # http://localhost:3000
```

### Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (39 routes) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (kept at 0 problems) |

## Environment
All variables are optional for local dev. Without `RESEND_API_KEY`, the Contact/Apply forms log
submissions to the server console and still return success, so the full UX is testable. See
[`.env.example`](./.env.example).

| Var | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key — enables real email delivery |
| `CONTACT_TO_EMAIL` | Recipient for form submissions (default: contactus@exzelon.com) |
| `CONTACT_FROM_EMAIL` | Verified Resend sender |

## Project structure
```
src/
├─ app/                 # routes (App Router) + api/{contact,apply} + robots/sitemap/og
├─ components/          # navbar, footer, cards, forms, motion primitives, ui/
├─ content/             # all site copy as typed data (industries, services, jobs, …)
└─ lib/                 # site config, seo, validation, email, rate-limit, utils
```

## Features
- Distinctive animated hero with integrated job search, rotating headline, and animated stat counters
- Scroll-reveal sections, staggered grids, employer-logo marquee, testimonials carousel, FAQ accordion
- Filterable/searchable job board (mock data) with per-job detail + apply flow
- Per-industry landing pages, About, For Clients (6 services), Resources (blog, FAQ, compliance, feedback)
- SEO: metadata, Open Graph, dynamic OG image, JSON-LD (Organization, JobPosting, FAQPage), sitemap, robots
- Accessible (skip link, semantic headings, focus states, WCAG-AA intent) and fully responsive

See [`CLAUDE.md`](./CLAUDE.md) for architecture conventions and [`Plan_WIP.md`](./Plan_WIP.md) for status.

## Notes
- Imagery currently uses CSS gradients/placeholders — swap in real photography when available.
- No user accounts, authentication, or live job database (out of scope by design).
