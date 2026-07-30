'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

// Recharts is the heaviest dependency on the home page and the chart sits well
// below the fold — load it as its own chunk once the page is interactive.
const ResultsChart = dynamic(() => import('@/components/ResultsChart'), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

// ── Platform bars ─────────────────────────────────────────────────────────────
// The ramp is the one olive at descending strength rather than five hand-picked
// greens. It still reads as a ranking, and it cannot drift out of the palette.
const PLATFORMS = [
  { name: 'ChatGPT',    count: 1240, pct: 100, color: 'rgba(57,71,29,1)' },
  { name: 'Perplexity', count: 960,  pct: 77,  color: 'rgba(57,71,29,0.82)' },
  { name: 'Google AI',  count: 810,  pct: 65,  color: 'rgba(57,71,29,0.64)' },
  { name: 'Claude',     count: 560,  pct: 45,  color: 'rgba(57,71,29,0.46)' },
  { name: 'Gemini',     count: 430,  pct: 35,  color: 'rgba(57,71,29,0.30)' },
];


export default function ResultsDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const floatRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Horizontal bars widen on scroll-enter
    PLATFORMS.forEach((p, i) => {
      const el = barRefs.current[i];
      if (!el) return;
      gsap.fromTo(el,
        { width: '0%' },
        { width: `${p.pct}%`, duration: 1.2, ease: 'power2.out', delay: i * 0.1,
          scrollTrigger: { trigger: containerRef.current, start: 'top 72%', once: true } }
      );
    });

    // Floating card gentle parallax
    gsap.to(floatRef.current, {
      y: -18, ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }, []);

  return (
    <section
      className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100"
      id="results"
      ref={containerRef}
    >
      {/* The 1440 grid, the 64px gap and the lg:pt-10 below are the original
          composition — the copy column is optically aligned to the dashboard
          card, not to the top of the grid. Narrowing or tightening them pulls
          the heading off the card and the section stops reading as one object. */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[28%_1fr] gap-16 items-start">

          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <div className="lg:pt-10">
            <Eyebrow className="mb-5">Track Authority</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
              html="Visualizing authority compounding."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[30ch]">
              We track the signals that matter across leading AI platforms—so you can see your visibility
              grow, not just feel it.
            </p>
          </div>

          {/* ── Right: dashboard + floating card ───────────────────────── */}
          <div className="relative">

            {/* Dashboard card */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]">

              {/* Chrome bar */}
              <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-2 bg-gray-50/40 rounded-t-3xl">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase ml-4">
                  Citations Analytics · Q2 2026
                </span>
              </div>

              {/* Two-column body */}
              <div className="grid grid-cols-1 md:grid-cols-[55%_45%] md:divide-x divide-gray-50">

                {/* ── Left panel: Recharts line chart ───────────────────── */}
                <div className="p-7 lg:p-9">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
                    AI Visibility Growth
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium leading-none mb-1">Mentions</p>
                  <p className="text-[38px] font-bold text-[#39471D] leading-none mb-1">+540%</p>
                  <p className="text-[11px] text-gray-400 font-medium mb-5 leading-relaxed">
                    Increase in AI platform mentions over 6 months
                  </p>

                  {/* Real chart — coordinate-based, not hand-drawn.
                      accessibilityLayer + outline resets kill the black focus/
                      tap box Recharts otherwise draws around the plot on tap. */}
                  <div
                    className="[&_*]:outline-none [&_.recharts-surface]:outline-none focus:outline-none select-none"
                    style={{ height: '148px', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <ResultsChart />
                  </div>
                </div>

                {/* ── Right panel: platform bars + average position ──────── */}
                <div className="p-7 lg:p-9 flex flex-col">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-5">
                    Top AI Platforms
                  </p>

                  <div className="flex flex-col gap-4 flex-1">
                    {PLATFORMS.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="text-[12px] font-medium text-gray-600 w-[76px] flex-shrink-0">
                          {p.name}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-[7px] overflow-hidden">
                          <div
                            ref={(el) => { barRefs.current[i] = el; }}
                            className="h-full rounded-full"
                            style={{ width: '0%', backgroundColor: p.color }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 w-10 text-right tabular-nums">
                          {p.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider + Average Position */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
                      Average Position
                    </p>
                    <div>
                      <span className="text-[36px] font-bold text-gray-900 leading-none">2.3</span>
                      <span className="text-[12px] font-medium text-gray-400 block mt-0.5">
                        vs. 8.7 industry avg.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card — peeks out below-left of dashboard */}
            <div
              ref={floatRef}
              className="absolute -left-3 -bottom-8 bg-white border border-gray-200 px-5 py-4 rounded-2xl shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] z-20 flex flex-col gap-1 pointer-events-none"
            >
              <span className="text-[22px] font-bold text-[#39471D] leading-none">+420%</span>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400">
                Platform growth
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
