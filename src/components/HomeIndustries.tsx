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
 * photograph in the middle; the other four are small white cards straddling
 * its two edges, two a side. Each pair is set unevenly on purpose: one card
 * half over the photograph, the other further in (about two thirds over), so
 * they read as placed rather than as a frame. Neither extreme worked: fully
 * off the edge looked detached, fully inside looked boxed in. Each drifts a few pixels on a slow
 * cycle at its own offset, and on the way in they slide a short way out to
 * their places. Both motions were larger at first and read as jittery.
 *
 * The first version had five cards in a grid, the four white ones large and
 * empty; this one keeps them only as big as their names.
 *
 * All five go to /industries/ until each sector has a page of its own. Below
 * lg the composition becomes the photograph with a 2×2 of the small cards
 * under it.
 */

type Side = 'left' | 'right';

/* Positions at lg, as a share of the stage. The photograph spans the middle
   72% (its edges at 14% and 86%) and a card is about 19% wide, so 5% puts a
   card half over the edge and 8.5% puts it about two thirds over. The four
   are spread down the whole height of the photograph, top to near the
   bottom, at staggered heights so they never line up into a frame. */
const OTHERS: { name: string; side: Side; pos: string; delay: string }[] = [
  { name: 'Fintech', side: 'left', pos: 'lg:left-[5%] lg:top-[7%]', delay: '0s' },
  { name: 'Health Tech', side: 'left', pos: 'lg:left-[8.5%] lg:top-[52%]', delay: '-4s' },
  { name: 'Legal Tech', side: 'right', pos: 'lg:right-[8.5%] lg:top-[24%]', delay: '-2s' },
  { name: 'Specialized Software', side: 'right', pos: 'lg:right-[4%] lg:top-[76%]', delay: '-6s' },
];

export default function HomeIndustries() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-side]');
        gsap.from(cards, {
          x: (_, el: HTMLElement) => (el.dataset.side === 'left' ? 40 : -40),
          autoAlpha: 0,
          scale: 0.94,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: stageRef.current, start: 'top 70%', once: true },
        });
        gsap.from('[data-feature]', {
          scale: 0.97,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: stageRef.current, start: 'top 80%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: stageRef }
  );

  return (
    <section className="bg-[#F7F8F9] py-24 2xl:py-32 border-b border-gray-100 overflow-hidden" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center mb-12 2xl:mb-14">
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html='Who Do We <span class="italic text-[#39471D]">Work With?</span>'
          />
          <p className="mx-auto text-gray-500 font-medium text-base leading-relaxed max-w-[56ch]">
            Our work is a fit for companies whose expertise, capabilities or approach need to be understood before a
            customer commits.
          </p>
        </div>

        <p className="text-center text-[13.5px] font-bold text-gray-900 mb-6">
          Explore how we apply that work to your industry:
        </p>

        <div ref={stageRef} className="relative mx-auto max-w-[1240px] lg:h-[560px]">
          {/* ── Professional services, in the middle ───────────────────── */}
          <a
            data-feature
            href={`${BASE}/industries/`}
            className="group relative isolate z-0 flex h-[380px] lg:h-full w-full lg:w-[72%] lg:mx-auto flex-col items-center justify-end overflow-hidden rounded-[32px] bg-[#171A10] p-8 sm:p-12 text-center shadow-[0_30px_70px_-30px_rgba(23,26,16,0.55)]"
          >
            <img
              loading="lazy"
              decoding="async"
              src={`${BASE}/shift.webp`}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05]">
              Professional Services
            </span>
            <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#39471D] transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight className="text-[15px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>

          {/* ── The other four, floating over its edges ────────────────── */}
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:block">
            {OTHERS.map(({ name, side, pos, delay }) => (
              <li key={name} data-side={side} className={`lg:absolute lg:z-10 ${pos}`}>
                {/* The float lives on its own wrapper so it never fights the
                    hover lift on the link inside it. Desktop only: on a phone
                    the cards sit in a grid and stay still. */}
                <div className="float-lg" style={{ animationDelay: delay }}>
                  <a
                    href={`${BASE}/industries/`}
                    className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 lg:min-w-[230px] lg:px-5 lg:py-4 shadow-[0_18px_40px_-18px_rgba(23,26,16,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#39471D]/40"
                  >
                    <span className="text-[15px] lg:text-base font-semibold tracking-tight text-gray-900">{name}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors duration-300 group-hover:border-[#39471D] group-hover:bg-[#39471D] group-hover:text-white">
                      <ArrowUpRight className="text-[11px]" />
                    </span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
