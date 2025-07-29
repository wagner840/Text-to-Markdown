import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ✅ Essencial para Docker deployment
  turbopack: {
    // Turbopack configuration for faster builds (moved from experimental.turbo)
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  reactStrictMode: true,
};

export default nextConfig;
