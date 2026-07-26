import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ServicesLanding from '@/components/ServicesLanding';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'AI Visibility Audits, the Authority Engine and flagship projects — the work that makes B2B brands the answer ChatGPT, Perplexity and Google AI give first.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/services/' },
  openGraph: {
    title: 'Services · Thallo Digital',
    description:
      'AI Visibility Audits, the Authority Engine and flagship projects — the work that makes B2B brands the answer AI gives first.',
    url: 'https://theo272004.github.io/thallo-digital/services/',
  },
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ServicesLanding />
      </main>
      <Footer />
    </div>
  );
}
