import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import IndustriesLanding from '@/components/IndustriesLanding';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'How AI visibility work plays out in fintech, health tech, professional services and health & recovery — where buyers research before they ever contact you.';

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
