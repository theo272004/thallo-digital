import type { MetadataRoute } from 'next';
import { LIVE_CASES } from '@/lib/cases';
import { lastModified } from '@/lib/lastmod';

const SITE_URL = 'https://thallodigital.com';

// Required by `output: export` — the sitemap is baked at build time.
export const dynamic = 'force-static';

/**
 * What each page is made of, for the purposes of `<lastmod>`.
 *
 * A route is its `page.tsx` plus the components that carry its content. The
 * chrome is deliberately absent: `Navbar` and `Footer` appear on every page, so
 * counting them would make one nav tweak claim that all twelve pages changed —
 * the sort of sitemap Google learns to ignore. `src/lib/site.ts` is left out for
 * the same reason.
 *
 * When a page grows a new section, add its file here. The cost of forgetting is
 * a date that lags, not a broken build.
 */
const SOURCES = {
  home: [
    'src/app/page.tsx',
    'src/components/Hero',
    'src/components/About.tsx',
    'src/components/TheProblem.tsx',
    'src/components/PlaybookContrast.tsx',
    'src/components/HowItWorks.tsx',
    'src/components/ScannerStripe.tsx',
    'src/components/HomeFaq.tsx',
    'src/components/Testimonials.tsx',
    'src/components/CTASection.tsx',
  ],
  about: ['src/app/about/page.tsx', 'src/components/AboutLanding.tsx', 'src/lib/team.ts'],
  services: ['src/app/services/page.tsx', 'src/components/ServicesLanding.tsx'],
  industries: ['src/app/industries/page.tsx', 'src/components/IndustriesLanding.tsx'],
  results: ['src/app/results/page.tsx', 'src/components/CaseStudiesLanding.tsx', 'src/lib/cases.ts'],
  caseStudy: ['src/app/results/[slug]/page.tsx', 'src/components/ResultsLanding.tsx', 'src/components/ResultsChart.tsx', 'src/components/ResultsDashboard.tsx', 'src/lib/cases.ts'],
  scan: ['src/app/thallo-ai/scan/page.tsx', 'src/components/scan', 'src/lib/scan'],
  method: ['src/app/thallo-ai/method/page.tsx', 'src/components/ThalloAIPage.tsx'],
  contact: ['src/app/contact/page.tsx', 'src/components/ContactLanding.tsx', 'src/components/PlanEnquiryForm.tsx'],
  // The three legal documents share a renderer and a block of company details,
  // so a change to either genuinely changes all three pages.
  terms: ['src/app/terms/page.tsx', 'src/components/LegalDoc.tsx', 'src/lib/legal.ts'],
  refund: ['src/app/refund-policy/page.tsx', 'src/components/LegalDoc.tsx', 'src/lib/legal.ts'],
  privacy: ['src/app/privacy/page.tsx', 'src/components/LegalDoc.tsx', 'src/lib/legal.ts'],
} as const;

type Entry = MetadataRoute.Sitemap[number];

/**
 * One sitemap entry, with `<lastmod>` present only when git could date it.
 */
function entry(path: string, sources: readonly string[], rest: Omit<Entry, 'url' | 'lastModified'>): Entry {
  const date = lastModified(...sources);
  return { url: `${SITE_URL}${path}`, ...(date && { lastModified: date }), ...rest };
}

/**
 * Static sitemap — emitted to /thallo-digital/sitemap.xml by `output: export`.
 * Submit that URL directly in Search Console: a project-scoped GitHub Pages
 * site can't own /robots.txt at the domain root.
 *
 * The blog is not in here. It lives in WordPress at /blog/ and publishes its own
 * sitemap; `src/app/robots.ts` is where the two are declared side by side.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry('/', SOURCES.home, { changeFrequency: 'monthly', priority: 1 }),
    entry('/about/', SOURCES.about, { changeFrequency: 'monthly', priority: 0.8 }),
    entry('/services/', SOURCES.services, { changeFrequency: 'monthly', priority: 0.8 }),
    entry('/industries/', SOURCES.industries, { changeFrequency: 'monthly', priority: 0.8 }),
    entry('/results/', SOURCES.results, { changeFrequency: 'monthly', priority: 0.8 }),
    // One entry per published case — derived from the same index the page reads,
    // so a new case study cannot be shipped and left out of the sitemap.
    ...LIVE_CASES.map((c) =>
      entry(`/results/${c.slug}/`, SOURCES.caseStudy, { changeFrequency: 'monthly', priority: 0.7 }),
    ),
    // The tool itself. /thallo-ai/ — the demo that used to stand in front of it
    // — is out of the build, so the scan is the URL to index.
    entry('/thallo-ai/scan/', SOURCES.scan, { changeFrequency: 'monthly', priority: 0.7 }),
    entry('/thallo-ai/method/', SOURCES.method, { changeFrequency: 'monthly', priority: 0.6 }),
    entry('/contact/', SOURCES.contact, { changeFrequency: 'yearly', priority: 0.7 }),
    // Low priority but deliberately indexed: a payment processor checking the
    // business is real should be able to find these without a crawl of the nav.
    entry('/terms/', SOURCES.terms, { changeFrequency: 'yearly', priority: 0.3 }),
    entry('/refund-policy/', SOURCES.refund, { changeFrequency: 'yearly', priority: 0.3 }),
    entry('/privacy/', SOURCES.privacy, { changeFrequency: 'yearly', priority: 0.3 }),
  ];
}
