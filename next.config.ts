import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the higher-quality logo render (see src/components/logo.tsx).
    qualities: [75, 90],
  },
};

export default nextConfig;
