import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack configuration for faster builds (moved from experimental.turbo)
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  // Enable React strict mode
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15, no need to specify
};

export default nextConfig;
