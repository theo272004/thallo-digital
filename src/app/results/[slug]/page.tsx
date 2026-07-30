import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResultsLanding from '@/components/ResultsLanding';
import { LIVE_CASES, getCaseStudy } from '@/lib/cases';

const SITE_URL = 'https://theo272004.github.io/thallo-digital';

type Params = { slug: string };

/**
 * One published case, one entry: the component that carries its body, plus the
 * metadata that belongs to that page rather than to the index at /results/.
 *
 * The bodies stay hand-written components — a case study is an argument, not a
 * template with the numbers swapped out — so this map is what ties a slug to
 * the one that belongs to it. Placeholders in `CASES` have no entry here and so
 * get no route at all.
 */
const PUBLISHED: Record<
  string,
  {
    Body: React.ComponentType;
    title: string;
    description: string;
    ogDescription: string;
  }
> = {
  'va-disability-claims': {
    // The original /results/ page, unchanged — it now lives at its own URL.
    Body: ResultsLanding,
    title: 'Case Study — Page Two to Page One',
    description:
      'Six months of Search Console data from a real engagement: 3.3x monthly organic clicks, +489% impressions, and average position climbing from page two to page one.',
    ogDescription:
      'Six months of Search Console data from a real engagement: 3.3x monthly organic clicks and average position climbing from page two to page one.',
  },
};

/**
 * `output: export` builds every page ahead of time, so the routes have to be
 * declared here — without this the dynamic segment has nothing to emit.
 */
export function generateStaticParams(): Params[] {
  return LIVE_CASES.map(({ slug }) => ({ slug }));
}

// Nothing is rendered on demand on a static host, so a slug outside the list
// above is a 404 rather than a page waiting to be built.
export const dynamicParams = false;

// `params` is a promise in Next 16 — await it before reading the slug.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = PUBLISHED[slug];
  if (!entry) return {};

  const url = `${SITE_URL}/results/${slug}/`;
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${entry.title} · Thallo Digital`,
      description: entry.ogDescription,
      url,
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = PUBLISHED[slug];

  // Both checks matter: the index is what the site treats as the source of
  // truth for what is publishable, and this map for what has a body written.
  if (!entry || getCaseStudy(slug)?.status !== 'live') notFound();

  const { Body } = entry;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Body />
      </main>
      <Footer />
    </div>
  );
}
