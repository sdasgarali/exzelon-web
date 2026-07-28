import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ];
  },
};

export default nextConfig;
