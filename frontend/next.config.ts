import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS domains
        // Note: This is safe since image URLs come from controlled mockData, not user input
      },
    ],
  },
};

export default nextConfig;
