import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import IndustriesLanding from '@/components/IndustriesLanding';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { pageGraph } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

/* All six sectors the page covers. It named four, so an assistant asked
   "does Thallo work with software companies?" had a summary saying no. */
const DESCRIPTION =
  'AI visibility for specialized software, fintech, health tech, professional services, health & recovery and benefits & claims — where buyers research before they contact you.';

export const metadata: Metadata = {
  title: 'Industries',
  description: DESCRIPTION,
  alternates: { canonical: 'https://thallodigital.com/industries/' },
  openGraph: {
    title: 'Industries · Thallo Digital',
    description:
      'AI visibility for fintech, health tech, professional services and health & recovery.',
    url: 'https://thallodigital.com/industries/',
  },
};

export default function IndustriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <JsonLd
        data={pageGraph({
          path: '/industries/',
          name: 'Industries · Thallo Digital',
          description: DESCRIPTION,
          crumbs: [{ name: 'Industries', path: '/industries/' }],
          extra: { mainEntity: { '@id': `${SITE_URL}/industries/#list` } },
        })}
      />
      <Navbar />
      <main className="flex-grow">
        <IndustriesLanding />
      </main>
      <Footer />
    </div>
  );
}
