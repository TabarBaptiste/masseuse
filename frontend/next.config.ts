import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Netlify - mode serverless
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
