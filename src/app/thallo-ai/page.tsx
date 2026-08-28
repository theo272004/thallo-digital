import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ToolPresentation from '@/components/scan/ToolPresentation';

import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Check my visibility',
  description:
    'Free AI visibility scan. We ask ChatGPT, Claude and Gemini the questions your buyers ask and count how often your brand is named — with every question and result shown.',
  alternates: { canonical: 'https://thallodigital.com/thallo-ai/' },
  openGraph: {
    title: 'Check my visibility · Thallo Digital',
    description:
      'Free AI visibility scan. We ask ChatGPT, Claude and Gemini the questions your buyers ask and count how often your brand is named.',
    url: 'https://thallodigital.com/thallo-ai/',
  },
};

/* Answers to the questions people actually ask about this tool, marked up so
   the assistants this page is about can quote them. A page selling AI
   visibility that is itself unquotable would be an odd thing to ship. The
   markup says nothing the page does not say in prose. */
const FAQ = [
  /* These numbers must match what the scan actually sends. The free tier was
     three questions for some time while this answer still said fifteen and
     forty-five answers, which is the kind of gap a reader finds by counting the
     rows in their own report — and once they have found one, they stop trusting
     the figures the report exists to deliver. */
  [
    'How do you measure AI visibility?',
    'You write three buying questions — the ones your buyers actually type — and we put every one of them to ChatGPT, Claude and Gemini twice: once with the web shut, to see what they already know, and once with search on, to see what they find. That is nine answers per reading. Your brand is never a word in the questions, so no answer is led, and every question and every result is printed beside the score.',
  ],
  [
    'Is the AI visibility scan free?',
    'Yes, and there is no account. You give a work email on the setup screen, because the report is emailed as well as shown and because each scan costs us real money on its first call. Three free scans, then the full audit is a commissioned engagement.',
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
      {/* Demonstration, then the tool.
          The page used to open straight onto the form, which is efficient for
          somebody who already knows what this is and opaque to everybody else.
          The full method still lives at /thallo-ai/method/ — what sits above
          the console now is not that: it is the report itself, playing, so the
          decision to run a scan is made by someone who has seen the output.
          The limits strip inside the console carries the part that is genuinely
          part of reading the result. */}
      <main className="flex-grow">
        <ToolPresentation />
      </main>
      <Footer />
    </div>
  );
}
