'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// The rewind-to-zero below must land BEFORE the browser paints, or the real
// figure flashes and snaps back. useLayoutEffect does that; on the server
// (static export pre-render) React warns about it, so fall back there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const STATS = [
  { val: 45, suffix: '%', label: 'AI Evaluation',           copy: 'of buyers used AI during a recent purchase to evaluate vendors.' },
  { val: 69, suffix: '%', label: 'Zero-Click Searches',     copy: 'of search queries now end directly inside conversational responses.' },
  { val: 1,  suffix: '',  label: 'Primary Recommendation',  copy: 'AI engines increasingly return one synthesized recommendation instead of ten blue links.' },
];

export default function TheProblem() {
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    // Reduced motion: the markup already carries the final figure — leave it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    STATS.forEach((item, i) => {
      const el = numRefs.current[i];
      if (!el) return;
      // The server renders the REAL figure so JS-less crawlers (GPTBot,
      // PerplexityBot, ClaudeBot) read "45%", never "0%". Rewinding to zero
      // here — inside a layout-phase effect, before first paint — keeps the
      // count-up without ever showing the wrong number to a human.
      el.innerText = '0' + item.suffix;
      const obj = { value: 0 };
      gsap.to(obj, {
        value: item.val,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none', once: true },
        onUpdate: () => { el.innerText = Math.round(obj.value) + item.suffix; },
      });
    });
  }, []);

  return (
    <section className="bg-[#F4FAF5] py-20 2xl:py-24 border-b border-gray-100" id="shift">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* ── Feature card — panoramic, full-width, dark image-backed ── */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#171A10] w-full aspect-[16/6] min-h-[360px] lg:min-h-0">
          <img loading="lazy" decoding="async"
            src="/thallo-digital/shift.webp"
            alt="Laptop with an analytics dashboard on a desk beside a sketchbook"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Readability scrim — dark on the left where the copy lives */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-transparent" />

          {/* Copy */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-[640px]">
            <Eyebrow tone="light" className="mb-6">The Shift</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] mb-6 font-sans"
              html="Buying now starts with a question typed into a machine."
            />
            <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed max-w-[46ch]">
              Search results pages of ten blue links are fading. Conversational AIs formulate
              recommendations directly. The brand it names first is the one that wins.
            </p>
          </div>
        </div>

        {/* ── Stat cards — three equal columns below the image ─────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {STATS.map((s, i) => (
            <div key={s.label} className="p-8 sm:p-10 bg-white border border-gray-100 rounded-3xl flex flex-col">
              <div
                className="text-5xl lg:text-6xl font-serif text-[#39471D] font-bold mb-3 tabular-nums"
                ref={(el) => { numRefs.current[i] = el; }}
              >
                {s.val}{s.suffix}
              </div>
              <p className="text-[12px] font-bold tracking-wider uppercase text-gray-900 mb-2">{s.label}</p>
              <p className="text-[15px] text-gray-500 leading-relaxed font-medium">{s.copy}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
