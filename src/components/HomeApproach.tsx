'use client';

import React from 'react';
import { SplitReveal, ScrollFill } from '@/components/motion';
import type { FillPart } from '@/components/motion/ScrollFill';
import { BASE } from '@/lib/site';

/**
 * "Show buyers what your customers already know."
 *
 * Built on the shift section's frame (src/components/TheProblem, now on
 * /home-archive/): the panoramic photograph with the heading over its dark
 * side, and white cards riding up over its bottom edge. Two cards rather than
 * three, because the copy is two paragraphs: what we find out, then what we do
 * with it.
 *
 * Cami's note was that this read as text and nothing else. Nothing was added
 * to it — the words are hers, unchanged — so the life comes from the reading
 * instead: each paragraph fills in word by word as it scrolls up (the same
 * ScrollFill the playbook's closing line used), and the phrases that carry the
 * argument finish in olive rather than near-black, so a skim still lands on
 * them.
 */

const INK = '#374151'; // gray-700: the body's resting colour once filled
const OLIVE = '#39471D';

const RESEARCH: FillPart[] = [
  {
    text: 'What customers value most about your business doesn’t always come through in your content. We interview your experts and conduct customer research, using sales materials and search data to really understand',
    color: INK,
  },
  { text: ' how buyers compare their options, what holds them back and what gives them confidence to choose you.', color: OLIVE },
];

const PLAN: FillPart[] = [
  {
    text: 'Then, we use those insights to plan your website’s structure, decide which content and resources to create and how we’ll distribute them to reach the right people. Over time, useful, credible work gives people',
    color: INK,
  },
  { text: ' a reason to remember your business and recommend it.', color: OLIVE },
];

export default function HomeApproach() {
  return (
    <section className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100" id="approach">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171A10] w-full aspect-[16/6] min-h-[340px] lg:min-h-0">
          <img
            loading="lazy"
            decoding="async"
            src={`${BASE}/shift.webp`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-[720px]">
            <SplitReveal
              as="h2"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] font-sans"
              html='Show Buyers <span class="italic text-[#CBD0AC]">What Your Customers Already Know.</span>'
            />
          </div>
        </div>

        {/* Same overlap as the shift section's cards: up over the photograph's
            bottom edge, a little wider than it from md. Equal height, always —
            the pair reads as one figure. */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-stretch gap-5 -mt-14 md:-mt-28 md:-mx-3 lg:-mx-4">
          {[RESEARCH, PLAN].map((parts, i) => (
            <div
              key={i}
              data-reveal
              className="lift transition-all duration-300 p-8 sm:p-11 bg-white border border-gray-200 rounded-3xl shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]"
            >
              <p className="text-[12px] font-bold tracking-wider text-[#8FA88A] mb-5 tabular-nums" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </p>
              <ScrollFill parts={parts} className="text-lg sm:text-xl font-medium leading-relaxed tracking-tight" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
