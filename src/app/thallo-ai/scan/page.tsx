import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ScanFlow from '@/components/scan/ScanFlow';
import JsonLd from '@/components/JsonLd';
import { ORG_ID, pageGraph } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

/* Said in full, because this is the line a search result or an assistant
   quotes for "is there a free way to check my AI visibility" — and the old
   one, "Run the Thallo AI visibility scan on your own brand", answered none
   of what someone deciding whether to try it wants to know. Every claim in it
   is one the tool page itself makes. */
const DESCRIPTION =
  'Free AI visibility scan: write the questions your buyers ask, and see whether ChatGPT, Claude, Gemini, Perplexity and Google AI Overview name your brand. No account, under a minute.';

export const metadata: Metadata = {
  title: 'Try the AI visibility scan',
  description: DESCRIPTION,
  alternates: { canonical: 'https://thallodigital.com/thallo-ai/scan/' },
  openGraph: {
    title: 'Try the AI visibility scan · Thallo Digital',
    description: DESCRIPTION,
    url: 'https://thallodigital.com/thallo-ai/scan/',
  },
};

export default function ThalloAIScan() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd
        data={pageGraph({
          path: '/thallo-ai/scan/',
          name: 'Thallo AI visibility scan',
          description: DESCRIPTION,
          crumbs: [{ name: 'Free scan', path: '/thallo-ai/scan/' }],
          extra: { mainEntity: { '@id': `${SITE_URL}/thallo-ai/scan/#app` } },
          nodes: [
            {
              '@type': 'WebApplication',
              '@id': `${SITE_URL}/thallo-ai/scan/#app`,
              name: 'Thallo AI visibility scan',
              url: `${SITE_URL}/thallo-ai/scan/`,
              description: DESCRIPTION,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any (runs in the browser)',
              isAccessibleForFree: true,
              offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
              creator: { '@id': ORG_ID },
              provider: { '@id': ORG_ID },
              // How it works, for anything that wants to check before it trusts.
              subjectOf: { '@id': `${SITE_URL}/thallo-ai/method/#article` },
            },
          ],
        })}
      />
      <Navbar />
      <main className="flex-grow"><ScanFlow /></main>
    </div>
  );
}
