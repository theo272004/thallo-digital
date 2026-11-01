'use client';

import React from 'react';
import { SplitReveal, ScrollFill } from '@/components/motion';
import type { FillPart } from '@/components/motion/ScrollFill';

/**
 * "Show buyers what your customers already know."
 *
 * No card and no photograph. The video right above it is already a dark
 * framed object, and a second one straight after read oddly (Cami, 1
 * November), so this section is type on the page's own ground: the heading
 * centred on two lines, and the two paragraphs side by side under it.
 *
 * Sizes are the site's, not this section's own: the heading is every h2's
 * text-4xl/5xl and the paragraphs are the body's text-base. A larger pass
 * (6xl heading, 2xl copy, one long column) made it the biggest and tallest
 * thing on the page, and Cami asked for it unified with the rest. The room it
 * needs comes from spacing instead: generous padding, a wide gap under the
 * heading and between the columns.
 *
 * What moves is the reading: each paragraph fills in word by word as it
 * scrolls up, from pale grey to ink, and the phrases that carry the argument
 * finish in olive so a skim still lands on them. Two earlier versions — white
 * cards over a photograph, then a dark photo banner — are in git history.
 */

const INK = '#4B5563'; // gray-600: a step darker than the body grey, so the fill reads
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
    <section className="bg-[#F7F8F9] py-28 2xl:py-36 border-b border-gray-100" id="approach">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
        <SplitReveal
          as="h2"
          className="max-w-[26ch] text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance"
          html='Show Buyers <span class="italic text-[#39471D]">What Your Customers Already Know.</span>'
        />

        <div className="mt-14 lg:mt-20 grid w-full max-w-[1120px] grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-20">
          <ScrollFill parts={RESEARCH} className="text-base font-medium leading-relaxed" />
          <ScrollFill parts={PLAN} className="text-base font-medium leading-relaxed" />
        </div>
      </div>
    </section>
  );
}
