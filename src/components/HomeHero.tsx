'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import BackgroundGrid from '@/components/Hero/BackgroundGrid';
import { SplitReveal, Magnetic, scrollToEl } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * The 1 November hero: one headline, centred, and two ways on.
 *
 * The phone-to-browser animation and the scan button that stood here are on
 * /home-archive/ (src/components/Hero), kept for when they come back. What
 * stays from that hero is its material: the faint grid behind, the masked line
 * reveal on the headline, the same two buttons in the same two weights.
 *
 * The words are Cami's homepage copy of 1 November, unchanged. The lede ends
 * on a no-break space so "finish." never sits alone on the last line.
 */
export default function HomeHero() {
  /* A full screen of its own, so the first thing anyone sees is the headline
     and nothing else; the video waits below the fold and pops in on the first
     scroll (HomeVideo). */
  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[100svh] flex items-center pt-28 pb-16">
      <BackgroundGrid />

      <div className="relative z-10 mx-auto max-w-[90rem] xl:max-w-[min(90rem,76vw)] w-full px-6 flex flex-col items-center text-center">
        <SplitReveal
          as="h1"
          scroll={false}
          fade={false}
          className="font-extrabold text-gray-900 mb-8 2xl:mb-10 max-w-[24ch] text-balance"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4.6rem)', lineHeight: '1.08', letterSpacing: '-0.03em' }}
          /* Italic in the heading's own weight, never thin: the second half of
             the line is the emphasis, the same way the old hero's last line
             was. The space between the spans keeps the raw HTML reading as one
             sentence for anything that quotes it. */
          html={
            '<span class="block font-sans">Build Authority That Helps</span> ' +
            '<span class="block mt-1 italic text-[#39471D]">The Right Customers Choose You.</span>'
          }
        />

        <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[56ch] mb-10 2xl:mb-12">
          We turn your team&rsquo;s expertise into clear, useful content, taking responsibility for the strategy,
          writing, SEO and distribution from start to&nbsp;finish.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToEl('#cta');
              }}
              className="px-8 py-4 sm:px-9 sm:py-[1.1rem] rounded-full text-base font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#55672E]/10"
            >
              Talk To Thallo
              <ArrowUpRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
            </a>
          </Magnetic>
          <a
            href={`${BASE}/results/`}
            className="px-8 py-4 sm:px-9 sm:py-[1.1rem] rounded-full text-base font-bold text-gray-800 border border-gray-200 bg-white hover:border-gray-400 transition-all flex items-center gap-2 group"
          >
            See Our Work
            <ArrowUpRight className="text-sm text-gray-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
