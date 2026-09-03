import type { MetadataRoute } from 'next';
import { BLOG_URL, SITE_URL } from '@/lib/site';

// Required by `output: export` — robots.txt is baked at build time.
export const dynamic = 'force-static';

/**
 * The domain had no robots.txt at all: thallodigital.com/robots.txt was a 404.
 *
 * WordPress normally serves a virtual one, but it only owns /blog/ here — the
 * root is the static export, and Apache answered / for a file nothing produced.
 * So nothing pointed a crawler at either sitemap.
 *
 * Generated rather than dropped in as a static file so the two URLs come from
 * `src/lib/site.ts`, the same constants every canonical tag reads. A robots.txt
 * that outlives a domain change is a robots.txt pointing at a sitemap that 404s.
 *
 * Only the Bluehost build lands at the domain root, which is the only place a
 * crawler reads this file. The GitHub Pages mirror puts it at
 * /thallo-digital/robots.txt, where it is inert — harmless, and not worth a
 * second build path to suppress.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // Two sitemaps, because the site is two systems on one domain: the static
    // export at the root, and WordPress at /blog/. SiteSEO names its index
    // sitemaps.xml — the plural is not a typo.
    sitemap: [`${SITE_URL}/sitemap.xml`, `${BLOG_URL}sitemaps.xml`],
  };
}
