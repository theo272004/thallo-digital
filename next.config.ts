import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.DEPLOY_TARGET === "bluehost" ? "" : "/thallo-digital",
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
