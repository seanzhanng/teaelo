import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // Allows all HTTP domains (for some logos that may use http)
      },
    ],
    // Allow all image sources (accept from anywhere)
    unoptimized: false,
  },
};

export default nextConfig;
