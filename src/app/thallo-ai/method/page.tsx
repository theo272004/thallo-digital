import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ThalloAIPage from '@/components/ThalloAIPage';
import Footer from '@/components/Footer';

/**
 * The method, on its own page.
 *
 * It used to sit underneath the console on /thallo-ai/, which made the tool
 * page read as a brochure about a tool rather than as the tool. A visitor who
 * came to run a scan had six sections of explanation under it; a visitor who
 * wanted the method had to scroll past a working console to reach it. Neither
 * was served well by the two being stacked.
 *
 * The content is unchanged and still worth having — it is the argument for why
 * the number means anything, and it is the sort of page an AI assistant can
 * quote, which for this business is the point.
 */
export const metadata: Metadata = {
  title: 'How the AI visibility scan works',
  description:
    'The method behind the Thallo visibility scan: the questions, the models, the scoring weights, and what the scan cannot tell you.',
  alternates: { canonical: 'https://thallodigital.com/thallo-ai/method/' },
  openGraph: {
    title: 'How the AI visibility scan works · Thallo Digital',
    description:
      'The questions, the models, the scoring weights, and what the scan cannot tell you.',
    url: 'https://thallodigital.com/thallo-ai/method/',
  },
};

export default function Method() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <ThalloAIPage />
      </main>
      <Footer />
    </div>
  );
}
