import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingIncludes: {
    "**": ["./src/generated/prisma/**"],
  },
};

export default nextConfig;
