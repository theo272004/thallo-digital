import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Our prices are public" — the three figures, on the home page, before anyone
 * has to ask.
 *
 * Added at Cami's request on 3 October 2026. Each figure is one the site
 * already states elsewhere and has to stay in step with: the free tier in
 * ResearchAndScan ("under a minute"), the audit in Services.tsx and AuditOffer,
 * the Engine's floor and term in Services.tsx, ServicesLanding.tsx and
 * HomeFaq.tsx. Grep for the old figure across the site when any of them moves.
 *
 * ## Bigger, with the same words
 *
 * On 5 October Cami found the three small price chips too slight and asked
 * for something different and longer — but the copy is fixed: no words beyond
 * the heading, the paragraph, the three names and their prices. So the
 * section grows by layout alone. Each tier is a tall card with its name at the
 * top and its figure set large at the foot, the price line split at its
 * " · " into the figure and the condition that goes with it.
 *
 * The Engine carries the olive border because it is the program; there is no
 * label saying so, since a label would be new copy.
 */
const PRICES = [
  { name: 'Free scan', lead: '', figure: '$0', unit: '', terms: 'under a minute', href: `${BASE}/thallo-ai/scan/` },
  { name: 'AI Visibility Audit', lead: '', figure: '$1,000', unit: '', terms: 'one time', href: `${BASE}/services/` },
  {
    name: 'Authority Engine',
    lead: 'from',
    figure: '$2,500',
    unit: '/mo',
    terms: '3-month term',
    href: `${BASE}/services/`,
    featured: true,
  },
];

export default function PublicPricing() {
  return (
    <section className="border-b border-gray-100 bg-[#F7F8F9] py-20 2xl:py-28" id="pricing">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#55672E]">
            No discovery-call pricing
          </p>
          <SplitReveal
            as="h2"
            className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
            html='Our prices are <span class="italic text-[#39471D]">public.</span>'
          />
          <p className="mx-auto mt-5 max-w-[56ch] text-base font-medium leading-relaxed text-gray-500">
            You shouldn&rsquo;t have to book a call to find out what something costs. Here are our prices, up front.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* The reveal moves the outer box and the hover lift moves the card
              inside it. On one element GSAP's inline transform would pin the
              card in place and the lift would never show. */}
          {PRICES.map((p) => (
            <div key={p.name} data-reveal className="flex">
              <a
                href={p.href}
                className={`lift group flex min-h-[300px] w-full flex-col justify-between rounded-[28px] border bg-white p-8 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 sm:p-10 lg:min-h-[340px] ${
                  p.featured ? 'border-[#39471D]' : 'border-gray-200'
                }`}
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="text-2xl font-bold tracking-tight text-gray-900">{p.name}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      p.featured
                        ? 'border-[#39471D] bg-[#39471D] text-white'
                        : 'border-gray-200 text-[#39471D] group-hover:border-[#39471D]'
                    }`}
                  >
                    <ArrowUpRight className="text-[12px]" />
                  </span>
                </span>

                <span className="block border-t border-gray-200/70 pt-6">
                  <span className="flex items-baseline gap-x-2 whitespace-nowrap">
                    {p.lead && <span className="text-base font-semibold text-gray-500">{p.lead}</span>}
                    <span className="font-sans text-5xl font-bold tracking-tight text-[#39471D] tabular-nums xl:text-6xl">
                      {p.figure}
                    </span>
                    {p.unit && <span className="text-base font-semibold text-gray-500">{p.unit}</span>}
                  </span>
                  <span className="mt-3 block text-[15.5px] font-medium text-gray-500">{p.terms}</span>
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
