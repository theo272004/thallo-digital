import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ScanFlow from '@/components/scan/ScanFlow';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Try the AI visibility scan',
  description: 'Run the Thallo AI visibility scan on your own brand.',
  alternates: { canonical: 'https://thallodigital.com/thallo-ai/scan/' },
  openGraph: {
    title: 'Try the AI visibility scan · Thallo Digital',
    description: 'Run the Thallo AI visibility scan on your own brand.',
    url: 'https://thallodigital.com/thallo-ai/scan/',
  },
};

export default function ThalloAIScan() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow"><ScanFlow /></main>
      <Footer />
    </div>
  );
}
