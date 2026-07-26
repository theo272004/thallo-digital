import type { MetadataRoute } from 'next';

const SITE_URL = 'https://theo272004.github.io/thallo-digital';

// Required by `output: export` — the sitemap is baked at build time.
export const dynamic = 'force-static';

/**
 * Static sitemap — emitted to /thallo-digital/sitemap.xml by `output: export`.
 * Submit that URL directly in Search Console: a project-scoped GitHub Pages
 * site can't own /robots.txt at the domain root.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/services/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/industries/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/thallo-ai/`, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
