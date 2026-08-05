'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import { GRID, GROUND } from '@/components/scan/ui';
import { BASE } from '@/lib/site';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

// Recharts is the heaviest dependency on the home page and the chart sits well
// below the fold — load it as its own chunk once the page is interactive.
const ResultsChart = dynamic(() => import('@/components/ResultsChart'), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

/**
 * Track Authority — the growth chart, inside the console that produces it.
 *
 * The section used to be a citations dashboard that no visitor could ever run:
 * a chart, five platform bars, a floating growth card, all invented. Thallo has
 * a real scanner now (/thallo-ai/), so the card wears the console's chrome and
 * carries a way in. The chart stayed, because the trajectory is the part of
 * this section that says what the work does to a brand over time.
 *
 * The figures are a sample and the strip says so. The tool itself refuses to
 * show unlabelled invented numbers; the page advertising it does the same.
 */
const READOUT = [
  { name: 'ChatGPT',    logo: 'chatgpt.svg',    pct: 62, verdict: 'Named',  tone: 'on'  },
  { name: 'Perplexity', logo: 'perplexity.png', pct: 44, verdict: 'Named',  tone: 'on'  },
  { name: 'Google AI',  logo: 'google.svg',     pct: 31, verdict: 'Mixed',  tone: 'mid' },
  { name: 'Gemini',     logo: 'google.svg',     pct: 18, verdict: 'Rarely', tone: 'off' },
] as const;

const VERDICT_TONE: Record<'on' | 'mid' | 'off', string> = {
  on:  'bg-[#39471D] text-white',
  mid: 'bg-[#E7ECD9] text-[#39471D]',
  off: 'bg-gray-100 text-gray-500',
};

/**
 * Two label faces, and the line between them is the frame.
 *
 * The dark strip is console chrome — Space Mono, exactly as /thallo-ai/ wears
 * it, because that strip is the tool speaking. Everything inside the white card
 * is the page speaking, and the dashboard that stood here before set its
 * micro-labels in Inter. Carrying mono across that line is what made the
 * readout look like a terminal print-out rather than a section of this site.
 */
function Chrome({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[12px] font-bold uppercase tracking-[0.2em] ${className}`}>{children}</span>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${className}`}>{children}</span>
  );
}

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
          composition — the copy column is optically aligned to the card, not to
          the top of the grid. */}
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
                <Chrome className="text-[#E7ECD9]">Thallo AI · visibility console</Chrome>
              </span>
              <Chrome className="text-[#CBD0AC]">Sample readout · 24 questions · 3 models</Chrome>
            </div>

            {/* One white card, as the dashboard here always was — the chart on
                the left, the per-model readout on the right, the way in below.
                They only sit side by side at xl: under that the section's own
                28%/1fr split leaves each column too narrow to hold a meter. */}
            <div
              className="relative mt-3 overflow-hidden rounded-xl bg-white"
              style={{ boxShadow: '0 18px 44px -26px rgba(23,26,16,.66)' }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-[46%_54%] xl:divide-x divide-gray-100">

                {/* ── Growth ──────────────────────────────────────────── */}
                <div className="p-6 lg:p-8">
                  <Label className="text-gray-400">AI visibility growth</Label>
                  <p className="mt-4 text-[11px] font-medium leading-none text-gray-400">Mentions</p>
                  <p className="mb-1 text-[38px] font-bold leading-none text-[#39471D]">+540%</p>
                  <p className="mb-5 text-[11px] font-medium leading-relaxed text-gray-400">
                    Increase in AI platform mentions over 6 months
                  </p>

                  {/* Real chart — coordinate-based, not hand-drawn.
                      The outline resets kill the black focus/tap box Recharts
                      otherwise draws around the plot on tap. */}
                  <div
                    className="select-none [&_*]:outline-none [&_.recharts-surface]:outline-none focus:outline-none"
                    style={{ height: '148px', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <ResultsChart />
                  </div>
                </div>

                {/* ── Per-model readout ───────────────────────────────── */}
                <div className="flex flex-col p-6 lg:p-8">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label className="text-gray-400">Share of answers</Label>
                    <Label className="text-gray-400">vs. 4 competitors</Label>
                  </div>

                  <div className="mt-6 flex flex-1 flex-col justify-center gap-5">
                    {READOUT.map((row, i) => (
                      <div key={row.name} className="flex items-center gap-2.5">
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
                        <span className="hidden w-[84px] shrink-0 text-[12px] font-medium text-gray-600 sm:block">
                          {row.name}
                        </span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[#E7ECD9]">
                          <span
                            ref={(el) => { barRefs.current[i] = el; }}
                            className="block h-full rounded-sm bg-[#39471D]"
                            style={{ width: '0%' }}
                          />
                        </span>
                        {/* Fixed width, or the meters stop at three different
                            places because "Rarely" is longer than "Named". */}
                        <Label className={`w-[86px] shrink-0 rounded-full px-3 py-1.5 text-center text-[12px] ${VERDICT_TONE[row.tone]}`}>
                          {row.verdict}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4 border-t border-gray-100 pt-5">
                    <div>
                      <Label className="text-gray-400">Answers naming you</Label>
                      <p className="mt-2.5 text-[34px] font-bold leading-none tracking-tight text-[#39471D] tabular-nums">
                        14<span className="text-gray-300">/24</span>
                      </p>
                    </div>
                    <p className="pb-1 text-[12px] font-medium text-gray-400">Across 3 models</p>
                  </div>
                </div>
              </div>

              {/* ── The way in ────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-5 lg:px-8">
                <p className="text-[13px] font-medium leading-relaxed text-gray-600">
                  Run the same scan on your own brand — free, no account, under a minute.
                </p>
                <a
                  href={`${BASE}/thallo-ai/`}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#171A10] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#39471D]"
                >
                  Scan my brand
                  <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
