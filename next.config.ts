import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increase body size limit for file uploads (default is 1MB)
      bodySizeLimit: "50mb",
    },
  },
  // Allow images from R2 custom domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.digiinsta.store",
      },
    ],
  },
};

export default withPayload(nextConfig);
