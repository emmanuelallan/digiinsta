import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.lemonsqueezy.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.digiinsta.store',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
