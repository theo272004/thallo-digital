import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ResultsLanding from '@/components/ResultsLanding';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Case Study — Page Two to Page One',
  description:
    'Six months of Search Console data from a real engagement: 3.3x monthly organic clicks, +489% impressions, and average position climbing from page two to page one.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/results/' },
  openGraph: {
    title: 'Case Study — Page Two to Page One · Thallo Digital',
    description:
      'Six months of Search Console data from a real engagement: 3.3x monthly organic clicks and average position climbing from page two to page one.',
    url: 'https://theo272004.github.io/thallo-digital/results/',
  },
};

export default function ResultsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ResultsLanding />
      </main>
      <Footer />
    </div>
  );
}
