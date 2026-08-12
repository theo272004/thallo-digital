import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import AboutLanding from '@/components/AboutLanding';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/site';

/* Rewritten with the page. These two lines had gone on describing the version
   before it — "the agency for the way buyers search now" was the old h1, still
   being served as the search-result summary of a page that no longer says it. */
export const metadata: Metadata = {
  title: 'About',
  description:
    'Search stopped sending buyers to websites. Why we built Thallo for the market that replaced it — what we believe, how an engagement runs, and who runs it.',
  alternates: { canonical: `${SITE_URL}/about/` },
  openGraph: {
    title: 'About · Thallo Digital',
    description:
      'We built Thallo for a market that changed — what we believe, how we work, and the people behind it.',
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
