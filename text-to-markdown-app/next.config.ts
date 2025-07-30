import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ✅ Para deploy SSR no Coolify
  reactStrictMode: true,
  images: {
    unoptimized: true, // ✅ Recomendado para self-hosting
  },
  // Remove configurações de export estático
};

export default nextConfig;
