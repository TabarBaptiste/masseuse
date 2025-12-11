import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Netlify - mode serverless
  images: {
    unoptimized: true,
  },
  // Désactiver les téléchargements de polices externes en développement
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
