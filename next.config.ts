import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.lemonsqueezy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ulxxhydpaxuhvlcjankh.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
