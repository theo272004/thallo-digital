'use client';

import React, { useRef } from 'react';
import { SplitReveal } from '@/components/motion';
import SpinFlower from '@/components/ui/SpinFlower';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/**
 * "Show buyers what your customers already know."
 *
 * No card and no photograph. The video right above it is already a dark
 * framed object, and a second one straight after read oddly (Cami, 1
 * November), so this section is type on the page's own ground: the heading
 * centred on two lines, and the two paragraphs side by side under it.
 *
 * Sizes are the site's, not this section's own: the heading is every h2's
 * text-4xl/5xl and the paragraphs are text-base, rising to text-lg from sm
 * exactly as the About statement's paragraph does. Both columns are
 * justified, at Cami's request, so they end square instead of ragged. A larger pass
 * (6xl heading, 2xl copy, one long column) made it the biggest and tallest
 * thing on the page, and Cami asked for it unified with the rest. The room it
 * needs comes from spacing instead: generous padding, a wide gap under the
 * heading and between the columns.
 *
 * Nothing in the copy moves. Each paragraph used to fill in word by word on
 * scroll, from pale grey to ink; it meant the section could only be read at
 * the speed of the scrollbar, and half-read if you stopped (Cami, 1
 * November), so the words are simply there now. What the fill was for — a
 * skim landing on the argument — the olive still does: the phrases that carry
 * it are set in it. ScrollFill itself is kept in motion/ for other uses. Two
 * earlier versions of the whole section — white cards over a photograph, then
 * a dark photo banner — are in git history.
 *
 * Type alone read as too bare (Cami, 2 November: "está muy solo ahí"), so it
 * takes two of the house's own marks and no new words: the turning isotipo
 * above the heading, as on the About statement, and an olive rule between the
 * two columns that draws down as they scroll past, joining research to plan.
 */

/** A run of the paragraph and the colour it is set in. */
type Part = { text: string; color: string };

const INK = '#4B5563'; // gray-600: a step darker than the body grey, so the olive reads against it
const OLIVE = '#39471D';

const RESEARCH: Part[] = [
  {
    text: 'What customers value most about your business doesn’t always come through in your content. We interview your experts and conduct customer research, using sales materials and search data to really understand',
    color: INK,
  },
  { text: ' how buyers compare their options, what holds them back and what gives them confidence to choose you.', color: OLIVE },
];

const PLAN: Part[] = [
  {
    text: 'Then, we use those insights to plan your website’s structure, decide which content and resources to create and how we’ll distribute them to reach the right people. Over time, useful, credible work gives people',
    color: INK,
  },
  /* The space before "it." is a no-break space, so the last word never ends
     up alone on a line of its own. */
  { text: ' a reason to remember your business and recommend it.', color: OLIVE },
];

export default function HomeApproach() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-rule]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-columns]', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-[#F7F8F9] py-32 2xl:py-40 border-b border-gray-100" id="approach">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
        <SpinFlower className="mb-8 block h-20 w-20 opacity-80" />
        <SplitReveal
          as="h2"
          className="max-w-[26ch] text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance"
          html='Show Buyers <span class="italic text-[#39471D]">What Your Customers Already Know.</span>'
        />

        <div data-columns className="relative mt-16 lg:mt-24 grid w-full max-w-[1200px] grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-20">
          {/* The rule between the columns: a hairline track, and the olive
              line that grows down it on scroll. Desktop only, where there are
              two columns to join. */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gray-200 md:block">
            <span data-rule className="absolute inset-0 origin-top bg-[#39471D]" />
          </span>
          <Paragraph parts={RESEARCH} />
          <Paragraph parts={PLAN} />
        </div>
      </div>
    </section>
  );
}

function Paragraph({ parts }: { parts: Part[] }) {
  return (
    <p className="text-base sm:text-lg font-medium leading-relaxed text-justify hyphens-none [text-wrap:pretty]">
      {parts.map((part) => (
        <span key={part.text} style={{ color: part.color }}>
          {part.text}
        </span>
      ))}
    </p>
  );
}
