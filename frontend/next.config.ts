import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'static1.squarespace.com',
      },
      {
        protocol: 'https',
        hostname: 'gong-cha-usa.com',
      },
      {
        protocol: 'https',
        hostname: 'www.scrapehero.com',
      },
    ],
  },
};

export default nextConfig;
