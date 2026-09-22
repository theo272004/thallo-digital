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
 * The writing.
 *
 * WordPress, in a subfolder of the same domain — so it is absolute rather than
 * `${BASE}/blog/`. On the GitHub Pages build there is no /blog/ to link to and
 * a relative path would 404 there; the blog only ever exists at one address.
 *
 * The index lived here for a day, at /articles/, so it could reuse this site's
 * components. That bought the look and cost the URL: /blog/ for the index and
 * /blog/name/ for an article is the pair that reads as one thing, and only
 * WordPress can serve that path — the deploy excludes it, which is the only
 * guard against a bad publish deleting the articles. So the index went back to
 * WordPress and the theme carries a copy of the navbar and footer instead.
 */
export const BLOG_URL = `${SITE_URL}/blog/`;

/**
 * The research.
 *
 * The AI Shortlist — the hub, and every volume under it. WordPress again, and
 * absolute for the same reason BLOG_URL is.
 *
 * ## Why this says /ai-shortlist/ and not /blog/ai-shortlist/
 *
 * It has two addresses. WordPress is installed in /blog/, so the hub answers
 * at /blog/ai-shortlist/ always. It *also* answers at /ai-shortlist/ — the
 * address Camila asked for, beside /services/ and /results/ — because the
 * rewrite in `deploy/ai-shortlist.htaccess` is now in the root .htaccess.
 *
 * That is the address the nav has to use (Cami, 2026-09-22): the button was
 * still sending readers into /blog/. The theme moves its own links by itself,
 * because it reads the .htaccess; this constant is baked into a static build
 * that never sees that file, so it is named here by hand.
 *
 * If the rule is ever taken out of the root .htaccess, this line has to go
 * back to `${SITE_URL}/blog/ai-shortlist/` or the button 404s.
 */
export const RESEARCH_URL = `${SITE_URL}/ai-shortlist/`;
