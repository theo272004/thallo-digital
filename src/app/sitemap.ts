import type { MetadataRoute } from 'next';
import { LIVE_CASES } from '@/lib/cases';

const SITE_URL = 'https://thallodigital.com';

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
    { url: `${SITE_URL}/results/`, changeFrequency: 'monthly', priority: 0.8 },
    // One entry per published case — derived from the same index the page reads,
    // so a new case study cannot be shipped and left out of the sitemap.
    ...LIVE_CASES.map((c) => ({
      url: `${SITE_URL}/results/${c.slug}/`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/thallo-ai/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/thallo-ai/method/`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact/`, changeFrequency: 'yearly', priority: 0.7 },
  ];
}
