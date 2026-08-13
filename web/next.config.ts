import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  rewrites: async () => [
    { source: '/api/:path*', destination: 'http://localhost:3003/api/:path*' }
  ],
};

export default nextConfig;
