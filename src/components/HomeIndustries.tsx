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

        {/* The photograph and the 2×2 share a row and a height, so the grid of
            four is exactly as tall as the picture beside it. */}
        <div
          ref={stageRef}
          className="mx-auto grid max-w-[1240px] gap-4 lg:h-[560px] lg:grid-cols-[37%_1fr] lg:gap-6"
        >
          {/* ── Professional services, the photograph ───────────────────── */}
          <a
            data-feature
            href={`${BASE}/industries/`}
            className="group relative isolate flex h-[380px] lg:h-full flex-col justify-end overflow-hidden rounded-[32px] bg-[#171A10] p-8 sm:p-10 shadow-[0_30px_70px_-30px_rgba(23,26,16,0.55)]"
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
              <span className="text-3xl sm:text-4xl 2xl:text-5xl font-bold tracking-tight text-white leading-[1.05]">
                Professional Services
              </span>
              <ArrowUpRight className="mb-1 text-[22px] text-white" />
            </div>
          </a>

          {/* ── The other four, two by two ──────────────────────────────── */}
          <ul className="grid grid-cols-2 grid-rows-2 gap-4 lg:gap-6">
            {OTHERS.map((name) => (
              <li key={name} data-card className="min-h-[140px]">
                <a
                  href={`${BASE}/industries/`}
                  className="group flex h-full flex-col justify-between rounded-[24px] border border-gray-200 bg-white p-6 sm:p-8 2xl:p-10 shadow-[0_18px_40px_-28px_rgba(23,26,16,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#39471D]/40"
                >
                  <span className="text-xl sm:text-2xl 2xl:text-[1.75rem] font-bold tracking-tight text-gray-900 leading-[1.15]">
                    {name}
                  </span>
                  <ArrowUpRight className="self-end text-[18px] text-[#39471D] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
