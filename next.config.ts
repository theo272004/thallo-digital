import type { NextConfig } from "next";

/* One switch decides where the site thinks it lives.
   · GitHub Pages serves it from a project subpath, /thallo-digital.
   · Bluehost serves it from the domain root, so the prefix has to go.

   `basePath` covers what Next controls. It does NOT touch the hand-written
   hrefs and <img src> values throughout this codebase — those read the same
   value from `src/lib/site.ts`, which is why it is exported to the client here
   as well. The two must always agree, so they are derived from one expression. */
const basePath = process.env.DEPLOY_TARGET === "bluehost" ? "" : "/thallo-digital";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
