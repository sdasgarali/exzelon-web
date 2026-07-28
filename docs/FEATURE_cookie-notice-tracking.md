# Feature — Cookie notice + AccessHub tracking

## Goal
Add a site-wide cookie notice (like the Neuraforz/Medeoan sites) and embed the AccessHub
analytics tracker for Exzelon.

## Decisions (per user)
- **Tracker always loads** on every page (marketing + auth + dashboards). The banner is
  **informational** (single "Got it" dismiss), not a consent gate.
- Scope: **all pages** (wired in the root `layout.tsx`).

## Implementation
- **Tracker** — root `src/app/layout.tsx` renders, on every page:
  ```html
  <Script src="https://accesshub.neuraforz.com/api/track.js" data-source="exz-web"
          strategy="afterInteractive" />
  ```
- **Cookie notice** — `src/components/cookie-notice.tsx` (client): fixed bottom banner, brand-styled,
  motion-safe (`fadeUp` keyframe in globals.css). Remembers dismissal in a first-party cookie
  `exz_cookie_notice=1` (1 year, SameSite=Lax, Secure on https) so it shows once. Links to
  `/resources/compliance` ("Learn more"). Rendered once in the root layout as a direct child of
  `<body>` (not inside any `backdrop-filter` element, per the fixed-overlay rule).
- **Re-open** — `src/components/cookie-notice-link.tsx` ("Cookie notice" in the footer bottom bar)
  dispatches the `exz:open-cookie-notice` window event, which the banner listens for.

## Notes / future
- If EU/consent-gating is needed later, switch the tracker to load only after an "Accept" choice
  (store `accepted`/`rejected` instead of a dismiss flag) — the banner already centralizes this.
- No Content-Security-Policy is configured, so the external script loads without a CSP allowlist. If a
  CSP is added later, allow `script-src https://accesshub.neuraforz.com`.

## Verification
- `npm run lint` + `npx tsc --noEmit` + `npm run build` green.
- Live: banner appears on first visit, "Got it" dismisses + sets the cookie (no re-show); footer
  "Cookie notice" re-opens it; `track.js` requested from accesshub.neuraforz.com on every page.
