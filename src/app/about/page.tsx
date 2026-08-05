import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import AboutLanding from '@/components/AboutLanding';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Thallo Digital is a marketing agency that builds the authority making companies the name search engines and AI models recommend first. What we do, how we work, and who runs it.',
  alternates: { canonical: `${SITE_URL}/about/` },
  openGraph: {
    title: 'About · Thallo Digital',
    description:
      'The agency for the way buyers search now — what we do, how we work, and the people behind it.',
    url: `${SITE_URL}/about/`,
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <AboutLanding />
      </main>
      <Footer />
    </div>
  );
}
