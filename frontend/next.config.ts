import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Netlify - mode statique
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Désactiver les API routes pour le mode statique
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
