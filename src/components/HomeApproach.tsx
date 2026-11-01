'use client';

import React, { useRef } from 'react';
import { SplitReveal, ScrollFill } from '@/components/motion';
import type { FillPart } from '@/components/motion/ScrollFill';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * "Show buyers what your customers already know."
 *
 * One dark banner, everything inside it: the heading, then the two paragraphs
 * side by side under a hairline. The first version put the paragraphs on white
 * cards riding up over the photograph, and Cami rejected that outright on
 * 1 November, so no cards.
 *
 * The life comes from two motions, neither of them adding words: the
 * photograph drifts slowly as the banner crosses the screen, and each
 * paragraph fills in word by word, finishing in the pale olive on the phrases
 * that carry the argument.
 *
 * The photograph is the shadowed wall (buyers-bg), dark on the left where the
 * copy sits. The laptop photograph went back to the professional services
 * card, at Cami's request, so the page does not show it twice.
 */

const BODY = 'rgba(255,255,255,0.82)';
const ACCENT = '#CBD0AC';
const UNFILLED = 'rgba(255,255,255,0.22)';

const RESEARCH: FillPart[] = [
  {
    text: 'What customers value most about your business doesn’t always come through in your content. We interview your experts and conduct customer research, using sales materials and search data to really understand',
    color: BODY,
  },
  { text: ' how buyers compare their options, what holds them back and what gives them confidence to choose you.', color: ACCENT },
];

const PLAN: FillPart[] = [
  {
    text: 'Then, we use those insights to plan your website’s structure, decide which content and resources to create and how we’ll distribute them to reach the right people. Over time, useful, credible work gives people',
    color: BODY,
  },
  { text: ' a reason to remember your business and recommend it.', color: ACCENT },
];

export default function HomeApproach() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  /* The drift: the photograph is a little taller than the banner and slides
     against it with the scroll, so the wall seems to sit behind the copy. */
  useGSAP(
    () => {
      if (!bannerRef.current || !photoRef.current || prefersReducedMotion()) return;
      gsap.fromTo(
        photoRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: bannerRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    },
    { scope: bannerRef }
  );

  return (
    <section className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100" id="approach">
      <div className="max-w-[1440px] mx-auto px-6">
        <div ref={bannerRef} className="relative isolate overflow-hidden rounded-[28px] bg-[#171A10]">
          <img
            ref={photoRef}
            loading="lazy"
            decoding="async"
            src={`${BASE}/buyers-bg.webp`}
            alt=""
            className="absolute inset-x-0 -top-[10%] -z-10 h-[120%] w-full object-cover object-right"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(100deg, rgba(23,26,16,.92) 0%, rgba(23,26,16,.78) 50%, rgba(23,26,16,.45) 100%)',
            }}
          />

          <div className="px-8 py-14 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
            <SplitReveal
              as="h2"
              className="max-w-[16ch] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] font-sans"
              html='Show Buyers <span class="italic text-[#CBD0AC]">What Your Customers Already Know.</span>'
            />

            <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 border-t border-white/15 pt-10 lg:pt-12">
              <ScrollFill
                parts={RESEARCH}
                from={UNFILLED}
                className="text-lg sm:text-xl font-medium leading-relaxed tracking-tight"
              />
              <ScrollFill
                parts={PLAN}
                from={UNFILLED}
                className="text-lg sm:text-xl font-medium leading-relaxed tracking-tight"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
