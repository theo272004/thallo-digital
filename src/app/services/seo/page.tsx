import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import SeoLanding from '@/components/SeoLanding';
import Footer from '@/components/Footer';

/**
 * /services/seo/ — the first of the four service pages (SEO, AEO, GEO, PR).
 *
 * Kept out of the index while it still carries pending figures: the case-study
 * numbers, the client quote and the monthly price are placeholders until Cami
 * has them (see `PENDING` in SeoLanding). Flip `robots` back and add the URL to
 * the sitemap in the same commit that fills them in.
 */
export const metadata: Metadata = {
  title: 'SEO',
  description:
    'Technical SEO, question research and pages that rank: the search foundation ChatGPT, Perplexity and Google AI Overviews draw on when they decide who to cite.',
  alternates: { canonical: 'https://thallodigital.com/services/seo/' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'SEO · Thallo Digital',
    description:
      'The search foundation your authority is built on. Technical SEO, content and links, built for Google and for the AI answers above it.',
    url: 'https://thallodigital.com/services/seo/',
  },
};

export default function SeoServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <SeoLanding />
      </main>
      <Footer />
    </div>
  );
}
