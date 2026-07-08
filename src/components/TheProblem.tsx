'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { val: 45, suffix: '%', label: 'B2B AI evaluation', copy: 'of B2B buyers used AI during a recent purchase to evaluate vendors.' },
  { val: 69, suffix: '%', label: 'Zero-Click Searches', copy: 'of searches now end without a single click to a website.' },
  { val: 1, suffix: '', label: 'Primary recommendation', copy: 'answer. AI gives one recommendation, not a page of ten links.' },
];

/**
 * "The Shift" — a large dark feature card (image-backed) with the section copy
 * laid over it, and a slim column of three stat cards beside it. On mobile the
 * stats stack under the card.
 */
export default function TheProblem() {
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    STATS.forEach((item, i) => {
      const el = numRefs.current[i];
      if (!el) return;
      const obj = { value: 0 };
      gsap.to(obj, {
        value: item.val,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        onUpdate: () => {
          el.innerText = Math.round(obj.value) + item.suffix;
        },
      });
    });
  }, []);

  return (
    <section className="bg-white py-24 border-b border-gray-100" id="shift">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-5 lg:gap-6 items-stretch">

          {/* ── Feature card — dark, image-backed, copy on top ─────────── */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#171a10] min-h-[420px] sm:min-h-[480px] lg:min-h-[540px]">
            {/* Image slot — drop the section photo here when it's ready:
                <img
                  src="/thallo-digital/shift.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                The scrim below keeps the copy readable on top of it. */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_75%_30%,#3a4227_0%,#23281a_45%,#14170e_100%)]" />

            {/* Readability scrim — darker toward the text corner */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/25 to-transparent" />

            {/* Copy */}
            <div className="relative z-10 p-8 sm:p-12 max-w-[600px]">
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

          {/* ── Stat cards — a slim column beside the feature card ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-5 lg:gap-6">
            {STATS.map((s, i) => (
              <div key={s.label} className="p-7 lg:p-8 bg-gray-50/70 border border-gray-100 rounded-3xl flex flex-col justify-center">
                <div
                  className="text-4xl lg:text-5xl font-serif text-[#39471D] mb-3 font-bold"
                  ref={(el) => { numRefs.current[i] = el; }}
                >
                  0{s.suffix}
                </div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-gray-900 mb-2">{s.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{s.copy}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
