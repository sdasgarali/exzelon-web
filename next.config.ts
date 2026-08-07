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
  // The default *.vercel.app deployment host is a full duplicate mirror of the
  // canonical www.exzelon.com site (confirmed via analytics). Tell crawlers not to
  // index it so it never competes with the canonical origin, while keeping preview
  // deployments fully functional for testing.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
