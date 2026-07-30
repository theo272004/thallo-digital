import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import VisibilityCheck from '@/components/VisibilityCheck';
import ThalloAIPage from '@/components/ThalloAIPage';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Visibility Check',
  description:
    'See how AI assistants describe your brand today — a walkthrough of the AI visibility report we run for clients.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/thallo-ai/' },
  openGraph: {
    title: 'Visibility Check · Thallo Digital',
    description:
      'See how AI assistants describe your brand today — a walkthrough of the AI visibility report we run for clients.',
    url: 'https://theo272004.github.io/thallo-digital/thallo-ai/',
  },
};

export default function ThalloAI() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        {/* The working tool first, on its own dark-green ground — the walkthrough
            below explains what a commissioned audit adds to it. */}
        <VisibilityCheck />
        <ThalloAIPage />
      </main>
      <Footer />
    </div>
  );
}
