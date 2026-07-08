'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

const PLATFORMS = [
  { name: 'ChatGPT',    count: 1240, pct: 100 },
  { name: 'Perplexity', count: 960,  pct: 77  },
  { name: 'Google AI',  count: 810,  pct: 65  },
  { name: 'Claude',     count: 560,  pct: 45  },
  { name: 'Gemini',     count: 430,  pct: 35  },
];

const SPARKLINE = [[0,35],[20,30],[40,28],[60,22],[80,18],[100,15],[120,8]];
const LINE_PTS   = [[10,148],[90,140],[170,115],[250,75],[330,42],[390,10]];

export default function ResultsDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<SVGPathElement>(null);
  const barRefs      = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const line = lineRef.current;
    if (line) {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
      });
    }

    PLATFORMS.forEach((p, i) => {
      const el = barRefs.current[i];
      if (!el) return;
      gsap.fromTo(el,
        { width: '0%' },
        {
          width: `${p.pct}%`,
          duration: 1.2,
          ease: 'power2.out',
          delay: i * 0.12,
          scrollTrigger: { trigger: containerRef.current, start: 'top 72%', once: true },
        }
      );
    });
  }, []);

  return (
    <section className="bg-gray-50/50 py-28 border-b border-gray-100" id="results" ref={containerRef}>
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
              We track the signals that matter across leading AI platforms—so you can see your visibility grow, not just feel it.
            </p>
          </div>

          {/* ── Right: dashboard card ───────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden">

            {/* Chrome bar */}
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-2 bg-gray-50/40">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase ml-4">
                Citations Analytics · Q2 2026
              </span>
            </div>

            {/* Two-column content */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-50">

              {/* Line chart */}
              <div className="p-8 lg:p-10">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">AI Visibility Growth</p>
                <p className="text-[10px] text-gray-400 font-medium mb-1">Mentions</p>
                <p className="text-4xl font-bold text-[#39471D] leading-none mb-1">+540%</p>
                <p className="text-[11px] text-gray-400 font-medium mb-8 leading-relaxed">
                  Increase in AI platform mentions over 6 months
                </p>

                <svg viewBox="0 0 400 160" className="w-full" style={{ height: '130px' }}>
                  {[20, 80, 140].map(y => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  <path
                    ref={lineRef}
                    d="M 10,148 C 80,142 120,130 170,108 S 260,72 300,48 S 360,24 390,10"
                    fill="none"
                    stroke="#39471D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {LINE_PTS.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#39471D" />
                  ))}
                </svg>

                <div className="flex justify-between mt-2">
                  {['Dec','Jan','Feb','Mar','Apr','May','Jun'].map(m => (
                    <span key={m} className="text-[9px] font-bold text-gray-400">{m}</span>
                  ))}
                </div>
              </div>

              {/* Horizontal bars + sparkline */}
              <div className="p-8 lg:p-10 flex flex-col">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Top AI Platforms</p>

                <div className="flex flex-col gap-4 flex-1">
                  {PLATFORMS.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-gray-600 w-[76px] flex-shrink-0">{p.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-[7px] overflow-hidden">
                        <div
                          ref={(el) => { barRefs.current[i] = el; }}
                          className="h-full bg-[#39471D] rounded-full"
                          style={{ width: '0%' }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600 w-10 text-right tabular-nums">
                        {p.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Average Position</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-4xl font-bold text-gray-900">2.3</span>
                      <span className="text-sm font-medium text-gray-400 ml-2">vs. 8.7 industry avg.</span>
                    </div>
                    <svg viewBox="0 0 120 44" className="w-24 h-8">
                      <polyline
                        points={SPARKLINE.map(([x,y]) => `${x},${y}`).join(' ')}
                        fill="none"
                        stroke="#39471D"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {SPARKLINE.map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="2.5" fill="white" stroke="#39471D" strokeWidth="1.8" />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
