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
 * centred, and the two paragraphs under it as one centred column at reading
 * size.
 *
 * What moves is the reading: each paragraph fills in word by word as it
 * scrolls up, from pale grey to ink, and the phrases that carry the argument
 * finish in olive so a skim still lands on them. Two earlier versions — white
 * cards over a photograph, then a dark photo banner — are in git history.
 */

const INK = '#1F2937'; // gray-800
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
    <section className="bg-[#F7F8F9] py-24 2xl:py-32 border-b border-gray-100" id="approach">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
        <SplitReveal
          as="h2"
          className="max-w-[18ch] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance"
          html='Show Buyers <span class="italic text-[#39471D]">What Your Customers Already Know.</span>'
        />

        <div className="mt-14 lg:mt-16 flex max-w-[60ch] flex-col gap-8 lg:gap-10">
          <ScrollFill parts={RESEARCH} className="text-xl sm:text-2xl font-medium leading-[1.55] tracking-tight" />
          <ScrollFill parts={PLAN} className="text-xl sm:text-2xl font-medium leading-[1.55] tracking-tight" />
        </div>
      </div>
    </section>
  );
}
