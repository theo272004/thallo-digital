'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { GRID, GROUND, Micro } from '@/components/scan/ui';
import { BASE } from '@/lib/site';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

/**
 * The section used to hold a citations dashboard — a chart, five platform bars
 * and a floating growth card, all of it invented. It said "we measure this"
 * without ever letting anyone measure anything.
 *
 * Thallo has a real scanner now (/thallo-ai/), so the visual is the console
 * itself: the same chrome, the same readout, one click from running it on your
 * own brand. The figures below are a sample and the strip says so — the tool
 * refuses to show unlabelled invented numbers, and the page that advertises it
 * should not either.
 */
const READOUT = [
  { name: 'ChatGPT',            logo: 'chatgpt.svg',    pct: 62, verdict: 'Named',     tone: 'on'  },
  { name: 'Perplexity',         logo: 'perplexity.png', pct: 44, verdict: 'Named',     tone: 'on'  },
  { name: 'Google AI Overview', logo: 'google.svg',     pct: 31, verdict: 'Sometimes', tone: 'mid' },
  { name: 'Gemini',             logo: 'google.svg',     pct: 18, verdict: 'Rarely',    tone: 'off' },
] as const;

const VERDICT_TONE: Record<'on' | 'mid' | 'off', string> = {
  on:  'bg-[#39471D] text-white',
  mid: 'bg-[#E7ECD9] text-[#39471D]',
  off: 'bg-gray-100 text-gray-500',
};

export default function ResultsDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs      = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    READOUT.forEach((row, i) => {
      const el = barRefs.current[i];
      if (!el) return;
      gsap.fromTo(el,
        { width: '0%' },
        { width: `${row.pct}%`, duration: 1.2, ease: 'power2.out', delay: i * 0.1,
          scrollTrigger: { trigger: containerRef.current, start: 'top 72%', once: true } }
      );
    });
  }, []);

  return (
    /* White ground: this section trades places with Industries, and the page's
       grey/white alternation travels with the slot, not with the component. */
    <section
      className="bg-white py-20 2xl:py-24 border-b border-gray-100"
      id="results"
      ref={containerRef}
    >
      {/* The 1440 grid, the 64px gap and the lg:pt-10 below are the original
          composition — the copy column is optically aligned to the console
          card, not to the top of the grid. */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[28%_1fr] gap-16 items-start">

          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <div className="lg:pt-10">
            <Eyebrow className="mb-5">Track Authority</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
              html="We track how you show up inside the AI."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[34ch]">
              When buyers ask ChatGPT or Perplexity who&rsquo;s best in your category, you should be in the answer. We
              engineer that and measure it against your competitors, every month.
            </p>

            <a
              href={`${BASE}/thallo-ai/`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#39471D] px-6 py-3.5 text-xs font-bold text-white transition-colors hover:bg-[#55672E] group"
            >
              Try the scanner free
              <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* ── Right: the console, one click from running on your brand ─── */}
          <div className="relative isolate overflow-hidden rounded-[28px] p-5 sm:p-7" style={GROUND}>
            <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />

            {/* Console strip — the same chrome the tool wears at /thallo-ai/ */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E7ECD9]/15 px-4 py-2.5">
              <span className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#CBD0AC]" />
                <Micro className="text-[#E7ECD9]">Thallo AI · visibility console</Micro>
              </span>
              <Micro className="text-[#CBD0AC]">Sample readout · 24 questions · 3 models</Micro>
            </div>

            {/* Side by side only at xl: below that the section's own 28%/1fr
                split leaves the card too narrow, and the readout rows lose
                their meters before they lose their labels. */}
            <div className="relative mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_minmax(0,280px)]">

              {/* Readout panel */}
              <div className="rounded-xl bg-white p-5 sm:p-6" style={{ boxShadow: '0 18px 44px -26px rgba(23,26,16,.66)' }}>
                <div className="flex items-baseline justify-between gap-3">
                  <Micro className="text-gray-400">Share of answers</Micro>
                  <Micro className="text-gray-400">vs. 4 competitors</Micro>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  {READOUT.map((row, i) => (
                    <div key={row.name} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${BASE}/logos/${row.logo}`}
                          alt=""
                          aria-hidden="true"
                          width={18}
                          height={18}
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span className="hidden sm:block w-[136px] shrink-0 text-[12px] font-medium text-gray-600">
                        {row.name}
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[#E7ECD9]">
                        <span
                          ref={(el) => { barRefs.current[i] = el; }}
                          className="block h-full rounded-sm bg-[#39471D]"
                          style={{ width: '0%' }}
                        />
                      </span>
                      <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-gray-700">
                        {row.pct}%
                      </span>
                      {/* Fixed width, or the meters end at four different
                          places because "Sometimes" is longer than "Named". */}
                      <Micro className={`hidden w-[86px] shrink-0 whitespace-nowrap rounded-sm px-2 py-1 text-center lg:block ${VERDICT_TONE[row.tone]}`}>
                        {row.verdict}
                      </Micro>
                    </div>
                  ))}
                </div>

                <p className="mt-6 border-t border-gray-100 pt-4 text-[11px] font-medium leading-relaxed text-gray-500">
                  Your brand is never named in the questions we ask, so nothing leads the answer. You see every question
                  and every result.
                </p>
              </div>

              {/* Score + the ask */}
              <div className="flex flex-col rounded-xl bg-white p-5 sm:p-6" style={{ boxShadow: '0 18px 44px -26px rgba(23,26,16,.66)' }}>
                <Micro className="text-gray-400">Answers naming you</Micro>
                <p className="mt-3 text-[44px] font-bold leading-none tracking-tight text-[#39471D] tabular-nums">
                  14<span className="text-gray-300">/24</span>
                </p>
                <Micro className="mt-2.5 block text-gray-400">Across 3 models</Micro>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="text-[13px] font-medium leading-relaxed text-gray-600">
                    Run the same scan on your own brand and see where you actually stand.
                  </p>
                </div>

                <a
                  href={`${BASE}/thallo-ai/`}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#171A10] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#39471D]"
                >
                  Scan my brand
                </a>
                <p className="mt-3 text-[11px] font-medium text-gray-400">
                  Free · no account · under a minute
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
