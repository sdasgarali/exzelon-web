import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the higher-quality logo render (see src/components/logo.tsx).
    qualities: [75, 90],
  },
  // Canonical host is the bare domain — permanently redirect www → non-www so search
  // engines consolidate on one origin (matches site.url / sitemap / canonical tags).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.exzelon.com" }],
        destination: "https://exzelon.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
