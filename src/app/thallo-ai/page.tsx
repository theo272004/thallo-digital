import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ScanFlow from '@/components/scan/ScanFlow';
import ThalloAIPage from '@/components/ThalloAIPage';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Check my visibility',
  description:
    'Free AI visibility scan. We ask ChatGPT, Claude and Gemini the questions your buyers ask and count how often your brand is named — with every question and result shown.',
  alternates: { canonical: 'https://theo272004.github.io/thallo-digital/thallo-ai/' },
  openGraph: {
    title: 'Check my visibility · Thallo Digital',
    description:
      'Free AI visibility scan. We ask ChatGPT, Claude and Gemini the questions your buyers ask and count how often your brand is named.',
    url: 'https://theo272004.github.io/thallo-digital/thallo-ai/',
  },
};

/* Answers to the questions people actually ask about this tool, marked up so
   the assistants this page is about can quote them. A page selling AI
   visibility that is itself unquotable would be an odd thing to ship. The
   markup says nothing the page does not say in prose. */
const FAQ = [
  [
    'How do you measure AI visibility?',
    'We put fifteen buying questions to ChatGPT, Claude and Gemini — forty-five answers in total — and count how many name your brand and at what rank. Your brand is never mentioned in the questions, so no answer is led. Every question and every result is shown alongside the score.',
  ],
  [
    'Is the AI visibility scan free?',
    'The first half is free and needs no account: your share of voice across the three models, your average rank, and the full audit trail. The second half — the competitors recommended instead of you, live retrieval, and the technical scorecard — is unlocked with an email address.',
  ],
  [
    'Which AI platforms do you check?',
    'ChatGPT, Claude and Gemini are asked from memory, with web search off. Perplexity and Google AI Overview are checked with live retrieval on, which measures something different: whether your pages are findable and quotable right now.',
  ],
  [
    'What is the difference between AI visibility and SEO?',
    'SEO measures whether a page ranks in a list of links. AI visibility measures whether a model names you inside its answer, where there is no list to scroll. A site can rank first on Google and go unmentioned by every model, because the two are read by different things for different reasons.',
  ],
  [
    'Why does my brand not appear in AI answers?',
    'Usually one of three things: nobody outside your own site cites you, so no model ever learned your name; your robots.txt blocks the crawlers those models read the web with; or your pages carry no structure a model can quote. The scan tells you which of the three applies to you.',
  ],
] as const;

export default function ThalloAI() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(([question, answer]) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: { '@type': 'Answer', text: answer },
            })),
          }),
        }}
      />
      <Navbar />
      <main className="flex-grow">
        {/* The working tool first, on its own dark-green ground — the method
            below explains what it measures and what it cannot. */}
        <ScanFlow />
        <ThalloAIPage />
      </main>
      <Footer />
    </div>
  );
}
