'use client';

import React, { useRef } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * "Who do we work with?"
 *
 * Meant to be the section that stops the scroll (Cami, 1 November: "tiene que
 * ser la más que llame la atención"). Professional services is the
 * photograph, and the other four sit beside it: the photograph on the left,
 * a 2×2 of white cards filling the rest of the row, both the same height.
 *
 * The version before this one floated the four cards over the two edges of a
 * centred photograph, each drifting on its own slow cycle. It read as
 * decoration over the picture rather than as four places to go, and the names
 * were the smallest type in the section; side by side they are four plain
 * cards the size of the photograph's half, which is what they are. The
 * floating composition is in git history at c8a492b.
 *
 * Smaller on 2 November (Cami: "las cartas están muy grandes"): the
 * photograph is square now rather than a tall strip, and the four are a 2×2
 * of cards wider than they are tall beside it: big enough to read as links
 * of their own, small enough that the photograph stays the main one. A
 * single column of thin rows was tried and read as too small.
 *
 * All five go to /industries/ until each sector has a page of its own. Below
 * lg the row stacks: the photograph, then the 2×2 under it.
 */

const OTHERS = ['Fintech', 'Health Tech', 'Legal Tech', 'Specialized Software'];

export default function HomeIndustries() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.from('[data-feature]', {
          scale: 0.97,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: stageRef.current, start: 'top 80%', once: true },
        });
        gsap.from(gsap.utils.toArray<HTMLElement>('[data-card]'), {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: stageRef.current, start: 'top 70%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: stageRef }
  );

  return (
    <section className="bg-[#F7F8F9] py-24 2xl:py-32 short:pt-24 short:pb-6 border-b border-gray-100 overflow-hidden" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mx-auto max-w-3xl short:max-w-4xl text-center mb-12 2xl:mb-14 short:mb-4">
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 short:mb-3 font-sans leading-[1.05]"
            html='Who Do We <span class="italic text-[#39471D]">Work With?</span>'
          />
          <p className="mx-auto text-gray-500 font-medium text-base leading-relaxed max-w-[56ch] short:max-w-none">
            Our work is a fit for companies whose expertise, capabilities or approach need to be understood before a
            customer commits.
          </p>
        </div>

        <p className="text-center text-[13.5px] font-bold text-gray-900 mb-6 short:mb-3">
          Explore how we apply that work to your industry:
        </p>

        {/* The photograph and the 2×2 share a row and a height, so the grid of
            four is exactly as tall as the picture beside it. */}
        <div
          ref={stageRef}
          className="mx-auto grid max-w-[1280px] gap-4 lg:h-[360px] 2xl:h-[380px] short:h-[clamp(280px,calc(100svh-390px),360px)] lg:grid-cols-[auto_1fr] lg:gap-5"
        >
          {/* ── Professional services, the photograph ───────────────────── */}
          <a
            data-feature
            href={`${BASE}/industries/`}
            className="group relative isolate flex h-[340px] lg:h-full lg:aspect-square flex-col justify-end overflow-hidden rounded-[28px] bg-[#171A10] p-7 sm:p-8 shadow-[0_30px_70px_-30px_rgba(23,26,16,0.55)]"
          >
            <img
              loading="lazy"
              decoding="async"
              src={`${BASE}/shift.webp`}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="flex items-end justify-between gap-6">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05]">
                Professional Services
              </span>
              {/* The white disc says "this is a link" as plainly as the four
                  cards' discs do. It stays white and still on hover (Cami,
                  1 November); only the photograph zooms. */}
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#39471D]">
                <ArrowUpRight className="text-[15px]" />
              </span>
            </div>
          </a>

          {/* ── The other four, two by two ──────────────────────────────── */}
          {/* The olive outline is always on (Cami, 3 November), in the full
              olive: a translucent one read as light green, which the site
              does not use. */}
          {/* Wider than they are tall, each a card in its own right — name at
              the top, arrow disc at the bottom — but smaller than the
              photograph, which is the one that matters most. Stacked in one
              column they read as thin rows; as square tiles, as too big. */}
          <ul className="grid grid-cols-2 gap-3 lg:grid-rows-2 lg:gap-4">
            {OTHERS.map((name) => (
              <li key={name} data-card>
                <a
                  href={`${BASE}/industries/`}
                  className="group flex h-full min-h-[130px] flex-col justify-between gap-4 rounded-[20px] border border-[#39471D] bg-white p-5 sm:p-6 shadow-[0_18px_40px_-28px_rgba(23,26,16,0.35)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-[1.15]">{name}</span>
                  <span className="flex h-10 w-10 self-end shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors duration-300 group-hover:border-[#39471D] group-hover:bg-[#39471D] group-hover:text-white">
                    <ArrowUpRight className="text-[13px]" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
