import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ServicesLanding from '@/components/ServicesLanding';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { PLANS_ID, pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'AI Visibility Audits, the Authority Engine and flagship projects — the work that makes brands the answer ChatGPT, Perplexity and Google AI give first.';

export const metadata: Metadata = {
  title: 'Our Plans',
  description: DESCRIPTION,
  alternates: { canonical: 'https://thallodigital.com/services/' },
  openGraph: {
    title: 'Our Plans · Thallo Digital',
    description:
      'AI Visibility Audits, the Authority Engine and flagship projects — the work that makes brands the answer AI gives first.',
    url: 'https://thallodigital.com/services/',
  },
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* The plans themselves — prices, terms, what each includes — are stated
          by ServicesLanding, beside the data they are read from. */}
      <JsonLd
        data={pageGraph({
          path: '/services/',
          name: 'Our Plans · Thallo Digital',
          description: DESCRIPTION,
          crumbs: [{ name: 'Our Plans', path: '/services/' }],
          extra: { mainEntity: { '@id': PLANS_ID } },
        })}
      />
      <Navbar />
      <main className="flex-grow">
        <ServicesLanding />
      </main>
      <Footer />
    </div>
  );
}
