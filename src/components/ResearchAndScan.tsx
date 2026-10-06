'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { BASE, RESEARCH_URL } from '@/lib/site';

/**
 * The research and the scan, side by side.
 *
 * Until 5 October 2026 these were two full-width sections one after the other
 * — ResearchCallout ("We measure this in public.") and ScannerStripe ("See how
 * the models describe you.") — each a single wide card with its button pushed
 * to the far right. Cami found them two identical bands with no purpose
 * between them and asked for them to be put together, one on each side.
 *
 * They are a natural pair: one is the proof that we measure what we sell (the
 * AI Shortlist), the other is the same measurement run on your own brand.
 * The words and the buttons are the ones the two sections carried; only the
 * layout changed. Since 6 October the scan is on the left and the research on
 * the right, at Cami's request — on a phone the scan comes first.
 *
 * ## The two cards are the same height
 *
 * The grid stretches both to the taller one and each card pins its button to
 * its foot, so the two read as one figure — the way Cami wants a pair.
 *
 * ## The scan's photograph
 *
 * `scanner-bg.webp` — the stone flower, the vase, the embossed notepad. At
 * full width the copy sat over the near-black left of the frame and needed
 * almost no scrim. At half width `object-cover` crops towards the middle and
 * the copy can land on the lit desk, so it gets a gradient from the top, where
 * the type is, fading towards the flower at the foot.
 *
 * ## Motion
 *
 * `data-reveal` sits on an outer box and the `lift` hover on the card inside
 * it. On one element GSAP's inline transform would pin the card and the lift
 * would never show.
 */
const CARD =
  'lift flex h-full w-full flex-col rounded-[28px] border transition-all duration-300 p-8 sm:p-12';

export default function ResearchAndScan() {
  return (
    <section className="border-b border-gray-100 bg-[#F7F8F9] py-24 lg:py-32 2xl:py-40" id="research">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-6 lg:grid-cols-2">
        {/* ── Scan ─────────────────────────────────────────────────────── */}
        <div data-reveal className="flex">
          <div className={`${CARD} relative isolate overflow-hidden border-transparent bg-[#171A10]`}>
            <img
              loading="lazy"
              decoding="async"
              src={`${BASE}/scanner-bg.webp`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(23,26,16,.88) 0%, rgba(23,26,16,.62) 55%, rgba(23,26,16,.35) 100%)',
              }}
            />

            {/* Same eyebrow height as the research card's label, so the two
                headings start on one line. Empty on purpose: no new words. */}
            <p aria-hidden="true" className="mb-4 hidden h-[16.5px] lg:block" />
            <h2 className="font-sans text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-[34px]">
              See how the models <span className="italic text-[#CBD0AC]">describe you.</span>
            </h2>
            <p className="mb-10 mt-4 max-w-[54ch] text-[15.5px] font-medium leading-relaxed text-[#CBD0AC]">
              Run your brand against real buying questions you write yourself, across ChatGPT, Claude and Gemini.
              You&rsquo;ll see how often you&rsquo;re named, and who gets named instead. Free, no account, under a
              minute.
            </p>
            <a
              href={`${BASE}/thallo-ai/scan/`}
              className="group mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-8 py-4 text-[13px] font-bold text-gray-900 transition-colors hover:text-[#39471D]"
            >
              Run my scan
              <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* ── Research ─────────────────────────────────────────────────── */}
        <div data-reveal className="flex">
          <div className={`${CARD} border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]`}>
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#55672E]">
              Our research
            </p>
            <SplitReveal
              as="h2"
              className="font-sans text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-[34px]"
              html='We measure this <span class="italic text-[#39471D]">in public.</span>'
            />
            <p className="mb-10 mt-4 max-w-[52ch] text-[15.5px] font-medium leading-relaxed text-gray-500">
              The AI Shortlist is our open research series on which companies AI models recommend, industry by
              industry. Full methodology, published results.
            </p>
            <a
              href={RESEARCH_URL}
              className="group mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full border border-[#39471D] px-8 py-4 text-[13px] font-bold text-[#39471D] transition-colors hover:bg-[#39471D] hover:text-white"
            >
              See the research
              <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
