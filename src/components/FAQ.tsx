'use client';

import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

type QA = { q: string; a: string };

/**
 * Plain-text answers — they feed BOTH the accordion and the FAQPage schema
 * below, so what a person reads and what a model ingests can never drift.
 */
const FAQS: QA[] = [
  {
    q: 'How does AI visibility work?',
    a: 'When someone asks ChatGPT, Perplexity or Google AI for a recommendation, the model assembles an answer from the sources it trusts on that topic. AI visibility is the work of becoming one of those sources: publishing material worth citing, structuring your site so machines can read and quote it, and earning mentions in the places models already draw from. Do that consistently and your name starts appearing inside the answer itself, not on a page of links below it.',
  },
  {
    q: 'How long until we see results?',
    a: 'First movement usually shows within six to ten weeks — new citations, your name surfacing on queries that used to return only competitors. Durable position takes closer to six months, because authority is cumulative by nature. We report monthly on what actually changed, so you are never waiting in the dark to find out whether it is working.',
  },
  {
    q: 'Do you work with local businesses?',
    a: 'Yes. A clinic, a restaurant, a studio or a law firm can own the AI answer for its city just as a software company owns it for its category — and locally there is often far less competition for it, so the work compounds faster. The method is the same; the queries and the places we earn mentions are the ones your neighbours actually use.',
  },
  {
    q: 'Can you help an existing website?',
    a: 'Almost always, and it is usually the faster path. Most sites already hold more credibility than they get credit for — it is just invisible to machines because of how the pages are structured, marked up and written. We start with what you have, fix what blocks it from being read and cited, and build from there. A rebuild is a recommendation we make only when the foundation genuinely cannot carry the work.',
  },
  {
    q: 'Do you create the content?',
    a: 'Yes — that is the core of it. We research and write original material grounded in your real expertise and your own data: the kind of work people cite and return to, and the kind a language model cannot fabricate. You review everything before it goes out. Your name is on it, so it has to sound like you.',
  },
  {
    q: 'What kinds of businesses do you work with?',
    a: 'Any business where being trusted decides the sale. That covers software and fintech, health and wellness, professional services and ecommerce, alongside local businesses, clinics, restaurants and independent studios. What our clients share is not a market segment — it is customers who research carefully before they choose, and who now do that research by asking a machine.',
  },
  {
    q: 'How is this different from SEO?',
    a: 'Classic SEO competes for a position in a list of links. AI visibility competes to be inside the answer, where there is no list — often just one recommendation. That shifts the work: less chasing keyword rankings, more building the authority and structure that make a model choose you as a source. Strong fundamentals still matter, and we do them. They are the floor now, not the whole job.',
  },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
        open ? 'border-[#39471D] bg-[#39471D]' : 'border-gray-200 bg-white group-hover:border-gray-400'
      }`}
    >
      <span
        className={`absolute h-px w-3.5 transition-colors duration-300 ${open ? 'bg-white' : 'bg-gray-700'}`}
      />
      <span
        className={`absolute h-px w-3.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'rotate-0 bg-white' : 'rotate-90 bg-gray-700'
        }`}
      />
    </span>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 sm:py-32 border-b border-gray-100" id="faq">
      {/* Machine-readable twin of the accordion — this is the shape AI answers
          quote from most readily, so it stays byte-identical to the copy above. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }),
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-[46ch] mb-16">
          <Eyebrow className="mb-6">FAQ</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
            html="Questions worth answering<br/>before we talk."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed">
            The things businesses ask us first — answered plainly, without the agency fog.
          </p>
        </div>

        <div data-reveal className="mx-auto max-w-[900px] border-t border-gray-100">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-gray-100">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span
                      className={`text-lg sm:text-xl font-bold tracking-tight transition-colors duration-300 ${
                        isOpen ? 'text-[#39471D]' : 'text-gray-900 group-hover:text-[#55672E]'
                      }`}
                    >
                      {item.q}
                    </span>
                    <PlusIcon open={isOpen} />
                  </button>
                </h3>

                {/* 0fr → 1fr animates real height with no JS measuring and no
                    max-height guesswork, so long answers never clip. */}
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-8 pr-12 sm:pr-20 text-[15px] leading-[1.75] text-gray-500 font-medium max-w-[68ch]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
