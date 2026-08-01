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

/**
 * The canonical home of this site.
 *
 * Always the real domain, including in the GitHub Pages build. Pages is a
 * mirror we use for review; pointing its canonicals at itself would invite
 * Google to index the mirror and split the site's authority in two.
 */
export const SITE_URL = 'https://thallodigital.com';

/**
 * The blog.
 *
 * WordPress, in a subfolder of the same domain — so it is absolute rather than
 * `${BASE}/blog/`. On the GitHub Pages build there is no /blog/ to link to, and
 * a relative path would 404 there; the blog only ever exists at one address.
 */
export const BLOG_URL = `${SITE_URL}/blog/`;
