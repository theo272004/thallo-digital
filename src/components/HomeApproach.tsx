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
 * November), so this section is type on the page's own ground.
 *
 * Sizes are the site's, not this section's own: the heading is every h2's
 * text-4xl/5xl and the paragraphs are text-base, rising to text-lg from sm
 * exactly as the About statement's paragraph does. Both columns are
 * justified, at Cami's request, so they end square instead of ragged. A larger pass
 * (6xl heading, 2xl copy, one long column) made it the biggest and tallest
 * thing on the page, and Cami asked for it unified with the rest. The room it
 * needs comes from spacing instead.
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
 * by the heading, as on the About statement, and an olive rule beside the
 * copy that draws down once as the section arrives.
 *
 * Then, the same day, the centred heading over two side-by-side paragraphs
 * went too ("no me gusta que esté estos dos párrafos así"). It is a split
 * now: the heading on the left, the two paragraphs stacked on the right, read
 * at once with nothing waiting below for another scroll. It was a full screen
 * tall at first and read big and empty (Cami, 2 November: "grandota y
 * vacía"), so it is only as tall as its copy, on a narrower measure, with
 * a smaller flower over the heading.
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
      /* Once, not scrubbed: the copy is whole the moment the section is on
         screen, and the rule only finishes drawing beside it. */
      gsap.fromTo(
        '[data-rule]',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: '[data-columns]', start: 'top 75%', once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="bg-[#F7F8F9] py-20 2xl:py-24 short:pt-24 short:pb-16 border-b border-gray-100"
      id="approach"
    >
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <SpinFlower className="block h-14 w-14 shrink-0 opacity-80" />
          <SplitReveal
            as="h2"
            className="max-w-[20ch] text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance"
            html='Show Buyers <span class="italic text-[#39471D]">What Your Customers Already Know.</span>'
          />
        </div>

        <div data-columns className="relative flex flex-col gap-6 lg:pl-12">
          {/* The rule beside the copy: a hairline track, and the olive line
              that draws down it once. Desktop only. */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gray-200 lg:block">
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
