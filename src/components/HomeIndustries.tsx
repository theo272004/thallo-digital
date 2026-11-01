import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Who do we work with?"
 *
 * Professional services is the one to notice, at Cami's request (1 November):
 * the large card, with its photograph, and the other four in white beside it.
 * All five go to /industries/ until each sector has a page of its own.
 *
 * "Explore how we apply that work to your industry:" sits directly over the
 * cards, starting where the professional services card starts. Under the intro
 * paragraph it was a second block of text beside the first, which read oddly;
 * over the cards it reads as their label.
 */

const OTHERS = ['Fintech', 'Health Tech', 'Legal Tech', 'Specialized Software'];

export default function HomeIndustries() {
  return (
    <section className="bg-[#F7F8F9] py-20 2xl:py-28 border-b border-gray-100" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mb-12 2xl:mb-14">
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html='Who Do We <span class="italic text-[#39471D]">Work With?</span>'
          />
          <p className="text-gray-500 font-medium text-base sm:text-lg leading-relaxed max-w-[56ch]">
            Our work is a fit for companies whose expertise, capabilities or approach need to be understood before a
            customer commits.
          </p>
        </div>

        <p className="text-[13.5px] font-bold text-gray-900 mb-4">Explore how we apply that work to your industry:</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:gap-5">
          {/* ── The large one ─────────────────────────────────────────── */}
          <li data-reveal className="sm:col-span-2 lg:row-span-2">
            <a
              href={`${BASE}/industries/`}
              className="group relative isolate flex h-full min-h-[300px] lg:min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-[#171A10] p-8 sm:p-10 transition-transform duration-300 hover:-translate-y-1 shadow-[0_12px_36px_-18px_rgba(23,26,16,0.45)]"
            >
              <img
                loading="lazy"
                decoding="async"
                src={`${BASE}/shift.webp`}
                alt=""
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
              <span className="flex items-end justify-between gap-6">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05]">
                  Professional Services
                </span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#39471D] transition-transform duration-300 group-hover:scale-105">
                  <ArrowUpRight className="text-[15px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </span>
            </a>
          </li>

          {/* ── The other four, in white ──────────────────────────────── */}
          {OTHERS.map((name) => (
            <li key={name} data-reveal>
              <a
                href={`${BASE}/industries/`}
                className="lift group flex h-full min-h-[140px] lg:min-h-0 flex-col justify-between gap-8 rounded-3xl border border-gray-200 bg-white p-7 transition-all duration-300 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]"
              >
                <span className="flex h-9 w-9 items-center justify-center self-end rounded-full border border-gray-200 text-gray-500 transition-colors duration-300 group-hover:border-[#39471D] group-hover:bg-[#39471D] group-hover:text-white">
                  <ArrowUpRight className="text-[12px]" />
                </span>
                <span className="text-xl font-semibold tracking-tight text-gray-900">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
