import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import IndustriesLanding from '@/components/IndustriesLanding';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'How AI visibility work plays out in fintech, health tech, professional services and health & recovery — where buyers research before they ever contact you.',
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
      <Navbar />
      <main className="flex-grow">
        <IndustriesLanding />
      </main>
      <Footer />
    </div>
  );
}
