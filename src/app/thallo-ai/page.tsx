import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScanFlow from '@/components/scan/ScanFlow';

const DESCRIPTION =
  'See whether ChatGPT, Claude and Gemini recommend your company — and which competitors they name instead.';

export const metadata: Metadata = {
  title: 'Visibility Check',
  description: DESCRIPTION,
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/thallo-ai/' },
  openGraph: {
    title: 'Visibility Check · Thallo Digital',
    description: DESCRIPTION,
    url: 'https://theo272004.github.io/thallo-digital/thallo-ai/',
  },
};

export default function ThalloAI() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ScanFlow />
      </main>
      <Footer />
    </div>
  );
}
