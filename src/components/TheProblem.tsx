'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// The rewind-to-zero below must land BEFORE the browser paints, or the real
// figure flashes and snaps back. useLayoutEffect does that; on the server
// (static export pre-render) React warns about it, so fall back there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Three figures, each with the study it came from.
 *
 * The attribution is not decoration. This is a page arguing that citing your
 * sources is what makes a brand quotable; three unsourced percentages on it
 * would be the argument failing on its own page. Where a figure cannot be
 * attributed it does not belong here — which is why the third card is now a
 * measured number about buyer behaviour rather than the "one recommendation
 * instead of ten blue links" line, which was a characterisation with a "1" set
 * in front of it as though it were data.
 */
const STATS = [
  {
    val: 45,
    suffix: '%',
    label: 'AI evaluation',
    copy: 'of B2B buyers used AI during a recent purchase to evaluate vendors.',
    src: 'Gartner, survey of 646 buyers, 2026',
  },
  {
    val: 68,
    suffix: '%',
    label: 'Zero-click searches',
    copy: 'of US Google searches now end without a single click to any website.',
    src: 'SparkToro / Similarweb, 2026',
  },
  {
    val: 85,
    suffix: '%',
    label: 'Day-one shortlists',
    copy: 'of B2B buyers purchase from the vendors they already had in mind before searching.',
    src: 'Bain & Company',
  },
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
    <section className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100" id="shift">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* ── Feature card — panoramic, full-width, dark image-backed ── */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#171A10] w-full aspect-[16/6] min-h-[360px] lg:min-h-0">
          <img loading="lazy" decoding="async"
            src={`${BASE}/shift.webp`}
            alt="Laptop with an analytics dashboard on a desk beside a sketchbook"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Readability scrim — dark on the left where the copy lives */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-transparent" />

          {/* Copy */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-[640px]">
            <SplitReveal
              as="h2"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] mb-6 font-sans"
              html="Search no longer sends buyers to websites. It answers for them."
            />
            <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed max-w-[46ch]">
              And whoever isn&rsquo;t in that answer doesn&rsquo;t get considered. Publishing more stopped working when
              publishing stopped costing anything. What AI can&rsquo;t fabricate is research only you could have done.
            </p>
          </div>
        </div>

        {/* ── Stat cards — three equal columns below the image ─────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {STATS.map((s, i) => (
            <div key={s.label} className="p-8 sm:p-10 bg-white border border-gray-200 rounded-3xl shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] flex flex-col">
              <div
                className="text-5xl lg:text-6xl font-serif text-[#39471D] font-bold mb-3 tabular-nums"
                ref={(el) => { numRefs.current[i] = el; }}
              >
                {s.val}{s.suffix}
              </div>
              <p className="text-[12px] font-bold tracking-wider uppercase text-gray-900 mb-2">{s.label}</p>
              <p className="text-[15px] text-gray-500 leading-relaxed font-medium">{s.copy}</p>
              {/* The source, in the muted green the site uses for secondary
                  marks. Set small and last so it is available to anyone
                  checking without competing with the figure it supports. */}
              <p className="mt-3.5 text-[11.5px] font-medium text-[#8FA88A]">{s.src}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
