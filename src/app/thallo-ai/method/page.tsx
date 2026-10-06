import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ThalloAIPage from '@/components/ThalloAIPage';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { ORG_ID, pageGraph } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

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
/* Not "the fifteen questions". The visitor writes their own, and there
       are three of them on a free scan — a description promising fifteen is
       read in a search result, before anybody can check it, which makes it the
       worst place on the site to be out of date. "The scoring weights" went
       with it: the technical scorecard they weighted no longer exists. */
const DESCRIPTION =
  'The method behind the Thallo visibility scan: the questions you write, the five models they go to, the two readings, and what the scan cannot tell you.';

export const metadata: Metadata = {
  title: 'How the AI visibility scan works',
  description: DESCRIPTION,
  alternates: { canonical: 'https://thallodigital.com/thallo-ai/method/' },
  openGraph: {
    title: 'How the AI visibility scan works · Thallo Digital',
    description:
      'The questions you write, the five models they go to, the two readings, and what the scan cannot tell you.',
    url: 'https://thallodigital.com/thallo-ai/method/',
  },
};

export default function Method() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd
        data={pageGraph({
          path: '/thallo-ai/method/',
          name: 'How the AI visibility scan works',
          description: DESCRIPTION,
          crumbs: [
            { name: 'Free scan', path: '/thallo-ai/scan/' },
            { name: 'Method', path: '/thallo-ai/method/' },
          ],
          extra: { mainEntity: { '@id': `${SITE_URL}/thallo-ai/method/#article` } },
          nodes: [
            {
              '@type': 'TechArticle',
              '@id': `${SITE_URL}/thallo-ai/method/#article`,
              headline: 'How the AI visibility scan works',
              description: DESCRIPTION,
              inLanguage: 'en',
              author: { '@id': ORG_ID },
              publisher: { '@id': ORG_ID },
              // The tool this is the method of.
              about: { '@id': `${SITE_URL}/thallo-ai/scan/#app` },
            },
          ],
        })}
      />
      <Navbar />
      <main className="flex-grow">
        <ThalloAIPage />
      </main>
      <Footer />
    </div>
  );
}
