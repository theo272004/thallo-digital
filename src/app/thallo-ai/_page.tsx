/*
 * ── HIDDEN, NOT DELETED ─────────────────────────────────────────────────────
 *
 * This was /thallo-ai/: the scrubbed camera move across the report, ending on
 * a button to the scan. It came off the site on 24 August 2026 — the demo was
 * a page explaining the tool standing between the reader and the tool, and
 * every CTA that used to land here now goes straight to /thallo-ai/scan/.
 *
 * The underscore is what takes it out of the build. Next.js opts a file or
 * folder prefixed with `_` out of routing entirely, so `_page.tsx` is
 * colocated in the route folder without being a route; /thallo-ai/scan/ and
 * /thallo-ai/method/ are unaffected, and there is no /thallo-ai/ any more.
 * Putting it back is renaming this file to `page.tsx` and restoring the
 * sitemap entry.
 *
 * Two things went with it, worth a decision rather than a drift:
 *
 *   · The FAQPage JSON-LD below. It is the only structured data on the site
 *     answering "how do you measure AI visibility", "is the scan free", "why
 *     does my brand not appear in AI answers" — which is exactly the material
 *     an assistant quotes. If the demo is not coming back, that block deserves
 *     a home on /thallo-ai/scan/ rather than sitting here unbuilt.
 *
 *   · /thallo-ai/ was a live, indexed URL. A static export has no redirects
 *     and the Bluehost deploy excludes .htaccess, so the 301 to
 *     /thallo-ai/scan/ has to be added on the server by hand.
 *
 * `ToolPresentation` itself is untouched in src/components/scan/ and nothing
 * else imports it.
 * ────────────────────────────────────────────────────────────────────────────
 */
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
