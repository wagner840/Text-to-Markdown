import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // ✅ Para gerar arquivos estáticos compatíveis com Nginx
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "dist", // ✅ Gera na pasta dist que o Coolify espera
  images: {
    unoptimized: true, // ✅ Necessário para export estático
  },
  reactStrictMode: true,
};

export default nextConfig;
