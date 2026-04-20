import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: ['@line-reader/shared'],
};

export default nextConfig;
