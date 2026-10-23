import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import CaseStudiesLanding from '@/components/CaseStudiesLanding';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { pageGraph } from '@/lib/schema';
import { LIVE_CASES } from '@/lib/cases';
import { SITE_URL } from '@/lib/site';

// The single case study that used to live here now has its own route,
// /results/va-disability-claims/ — this is the index that points at it.
const DESCRIPTION =
  'Engagements written up from platform exports over a named period — what changed, how long it took, and the industries we build authority in.';

export const metadata: Metadata = {
  title: 'Case Studies',
  description: DESCRIPTION,
  alternates: { canonical: 'https://thallodigital.com/results/' },
  openGraph: {
    title: 'Case Studies · Thallo Digital',
    description:
      'Engagements written up from platform exports over a named period — what changed, and how long it took.',
    url: 'https://thallodigital.com/results/',
  },
};

export default function ResultsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Lists only the published cases. The placeholders on the page say in
          words that they have no figures yet; in an ItemList they would read
          as two more case studies that exist. */}
      <JsonLd
        data={pageGraph({
          type: 'CollectionPage',
          path: '/results/',
          name: 'Case Studies · Thallo Digital',
          description: DESCRIPTION,
          crumbs: [{ name: 'Case Studies', path: '/results/' }],
          extra: {
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: LIVE_CASES.map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE_URL}/results/${c.slug}/`,
                name: `${c.headline} — ${c.metric} ${c.metricLabel ?? ''}`.trim(),
              })),
            },
          },
        })}
      />
      <Navbar />
      <main className="flex-grow">
        <CaseStudiesLanding />
      </main>
      <Footer />
    </div>
  );
}
