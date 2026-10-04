import React from 'react';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Our prices are public" — the three figures, on the home page, before anyone
 * has to ask.
 *
 * Added at Cami's request on 3 October 2026. Each figure is one the site
 * already states elsewhere and has to stay in step with: the free tier in
 * ScannerStripe ("under a minute"), the audit in Services.tsx and AuditOffer,
 * the Engine's floor and term in Services.tsx, ServicesLanding.tsx and
 * HomeFaq.tsx. Grep for the old figure across the site when any of them moves.
 */
const PRICES = [
  { name: 'Free scan', price: '$0 · under a minute', href: `${BASE}/thallo-ai/scan/` },
  { name: 'AI Visibility Audit', price: '$1,200 · one time', href: `${BASE}/services/` },
  { name: 'Authority Engine', price: 'from $2,500/mo · 3-month term', href: `${BASE}/services/` },
];

export default function PublicPricing() {
  return (
    <section className="border-b border-gray-100 bg-[#F7F8F9] py-16 2xl:py-24" id="pricing">
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-12 text-center shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] sm:px-12 sm:py-14">
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

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {PRICES.map((p) => (
              <a
                key={p.name}
                href={p.href}
                className="lift rounded-2xl border border-gray-200 bg-[#F7F8F9] px-6 py-7 transition-all duration-300 hover:border-[#55672E]/40"
              >
                <span className="block text-lg font-semibold tracking-tight text-gray-900">{p.name}</span>
                <span className="mt-2 block text-[15px] font-bold text-[#39471D]">{p.price}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
