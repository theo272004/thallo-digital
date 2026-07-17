import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/thallo-digital",
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
