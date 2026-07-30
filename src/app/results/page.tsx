import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import CaseStudiesLanding from '@/components/CaseStudiesLanding';
import Footer from '@/components/Footer';

// The single case study that used to live here now has its own route,
// /results/va-disability-claims/ — this is the index that points at it.
export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Engagements written up from platform exports over a named period — what changed, how long it took, and the industries we build authority in.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/results/' },
  openGraph: {
    title: 'Case Studies · Thallo Digital',
    description:
      'Engagements written up from platform exports over a named period — what changed, and how long it took.',
    url: 'https://theo272004.github.io/thallo-digital/results/',
  },
};

export default function ResultsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <CaseStudiesLanding />
      </main>
      <Footer />
    </div>
  );
}
