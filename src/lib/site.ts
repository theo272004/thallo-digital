/**
 * Where the site lives.
 *
 * On GitHub Pages it is served from a project subpath (`/thallo-digital`); on
 * Bluehost it is served from the domain root and the prefix has to disappear.
 * `next.config.ts` already switches `basePath` on `DEPLOY_TARGET` — but Next
 * only rewrites the paths it controls (`<Link>`, `next/image`), and this
 * codebase writes its hrefs and `<img src>` by hand. Those are plain strings;
 * nothing rewrites them.
 *
 * So the prefix comes from here instead, baked in at build time from the same
 * environment variable the config reads. Every hand-written internal path is
 * `${BASE}/…`, and a Bluehost build has BASE as the empty string.
 *
 * The default is the GitHub Pages subpath rather than '' so that a local `npm
 * run dev` — which runs with basePath '/thallo-digital' — matches without
 * anyone having to set up a .env file first.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '/thallo-digital';
