import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: __dirname,  // Fix for parent directory package.json confusion
  },
};

export default nextConfig;
