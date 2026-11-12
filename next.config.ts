import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;

