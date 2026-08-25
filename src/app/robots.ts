import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Required by `output: export` — the file is baked at build time, same as the sitemap.
export const dynamic = 'force-static';

/**
 * robots.txt, and the only place that names both sitemaps.
 *
 * The site is served from two roots and only one of them can own this file.
 * On Bluehost the export lands at the domain root, so this is
 * thallodigital.com/robots.txt and crawlers read it. On the GitHub Pages
 * mirror `basePath` pushes it to /thallo-digital/robots.txt, which no crawler
 * looks for — Pages only honours robots.txt at the domain root, and that root
 * belongs to the user site, not to this project. The mirror is kept out of the
 * index by the canonicals instead, which point at the real domain everywhere.
 *
 * Two sitemaps because the site is two applications. `/sitemap.xml` is this
 * Next export; `/blog/sitemaps.xml` is WordPress, which the deploy never
 * touches and which no page here links to as a sitemap. Without both listed,
 * the articles are only discoverable by crawling into /blog/ from a link.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/blog/sitemaps.xml`],
  };
}
