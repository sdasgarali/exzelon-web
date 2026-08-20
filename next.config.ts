import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF/WebP (with automatic fallback) so raster assets ship far fewer bytes.
    formats: ["image/avif", "image/webp"],
    // Allow the higher-quality logo render (see src/components/logo.tsx).
    qualities: [75, 90],
  },
  // Canonical host is www — permanently redirect the bare domain → www so search
  // engines consolidate on one origin (matches site.url / sitemap / canonical tags).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "exzelon.com" }],
        destination: "https://www.exzelon.com/:path*",
        permanent: true,
      },
      // Legacy .html pages from the original (lost) site are still indexed and
      // ranking in Google but now return 404. 301 them to the closest live page
      // so the accumulated ranking signal is consolidated instead of leaking to
      // dead URLs. The two below still show impressions in Search Console; the
      // catch-all covers any other stragglers Google may resurface.
      { source: "/engineering.html", destination: "/opportunities", permanent: true },
      { source: "/defence-aerospace.html", destination: "/opportunities", permanent: true },
      { source: "/:slug*.html", destination: "/", permanent: true },
    ];
  },
  async headers() {
    // Baseline security headers on every response. These are all non-breaking for a
    // Next.js + Framer Motion app: no Content-Security-Policy is set here on purpose —
    // a strict CSP needs nonce plumbing for Next's inline runtime scripts and must be
    // validated against the live app before shipping, or it white-screens production.
    // Track that as a follow-up (see Plan_WIP.md "full strict CSP").
    const securityHeaders = [
      // Force HTTPS for two years incl. subdomains; `preload` keeps us eligible for the
      // browser HSTS preload list. The site is HTTPS-only (bare domain 301s to www).
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      // Stop MIME-sniffing (blocks a class of drive-by content-type attacks).
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Clickjacking protection — the site is never meant to be framed cross-origin.
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Leak only the origin (not the full path) on cross-origin navigations.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Deny powerful browser features the site never uses.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      // The default *.vercel.app deployment host is a full duplicate mirror of the
      // canonical www.exzelon.com site (confirmed via analytics). Tell crawlers not to
      // index it so it never competes with the canonical origin, while keeping preview
      // deployments fully functional for testing.
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
