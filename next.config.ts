import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    unoptimized: true, // Disable if you want Next.js image optimization
  },
  
  // Optional: Configure trailing slash behavior
  trailingSlash: false,
};

export default nextConfig;
