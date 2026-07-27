import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ThalloAIPage from '@/components/ThalloAIPage';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Free AI Visibility Check',
  description:
    'See how AI assistants describe your business today — a walkthrough of the AI visibility report we run for clients, from software companies to local brands.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/thallo-ai/' },
  openGraph: {
    title: 'Free AI Visibility Check · Thallo Digital',
    description:
      'See how AI assistants describe your business today — a walkthrough of the AI visibility report we run for clients.',
    url: 'https://theo272004.github.io/thallo-digital/thallo-ai/',
  },
};

export default function ThalloAI() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ThalloAIPage />
      </main>
      <Footer />
    </div>
  );
}
