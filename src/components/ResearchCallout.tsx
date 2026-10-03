import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { RESEARCH_URL } from '@/lib/site';

/**
 * The home page's door to The AI Shortlist.
 *
 * Added at Cami's request on 3 October 2026. One card, one button: the series
 * is the proof that we measure what we sell, so it is offered as evidence
 * rather than as a feature, and kept short enough not to compete with the
 * argument around it.
 *
 * RESEARCH_URL is absolute and points at /ai-shortlist/, which only exists
 * while the rewrite in the root .htaccess does — see `src/lib/site.ts`.
 */
export default function ResearchCallout() {
  return (
    <section className="border-b border-gray-100 bg-white py-14 2xl:py-20" id="research">
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:px-16">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55672E]">
              Our research
            </p>
            <SplitReveal
              as="h2"
              className="font-sans text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-4xl"
              html='We measure this <span class="italic text-[#39471D]">in public.</span>'
            />
            <p className="mt-4 max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
              The AI Shortlist is our open research series on which companies AI models recommend, industry by
              industry. Full methodology, published results.
            </p>
          </div>
          <a
            href={RESEARCH_URL}
            className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#39471D] px-8 py-4 text-[13px] font-bold text-[#39471D] transition-colors hover:bg-[#39471D] hover:text-white lg:self-auto"
          >
            See the research
            <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
