'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * The first thing after the hero: who the buyer is and what they are doing.
 *
 * Cami's rewrite of 3 October moved this up to sit straight under the hero and
 * changed its words. The design stays — the panoramic photograph with the copy
 * over its dark side, three white cards under it — but the cards no longer
 * carry the three market figures. They carry the three questions a buyer asks
 * while researching, each with what we do about it.
 *
 * The figures (Gartner 45%, SparkToro/Similarweb 68%, Bain 85%) are in git
 * history at 11ef6b9 if they are wanted back somewhere else on the site.
 */
const QUESTIONS = [
  {
    q: 'Which providers fit a company like ours?',
    copy: 'Get clear on the buying questions that matter in your category.',
  },
  {
    q: 'What makes this company worth considering?',
    copy: 'Give buyers specific expertise, original evidence and useful answers.',
  },
  {
    q: 'What should we check before choosing?',
    copy: 'Help prospects understand capabilities, fit and practical differences.',
  },
];

export default function TheProblem() {
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
              html='Your next customer is <span class="italic text-[#CBD0AC]">doing their research.</span>'
            />
            <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed max-w-[46ch]">
              They compare providers, look for evidence, and decide who deserves a conversation. We work on the
              questions they ask and the material that helps them evaluate you.
            </p>
          </div>
        </div>

        {/* ── Question cards — three equal columns below the image ─────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {QUESTIONS.map((item, i) => (
            <div
              key={item.q}
              className="p-8 sm:p-10 bg-white border border-gray-200 rounded-3xl shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] flex flex-col"
            >
              <p className="text-[12px] font-bold tracking-wider text-[#8FA88A] mb-4 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-gray-900 leading-snug mb-3">
                &ldquo;{item.q}&rdquo;
              </h3>
              <p className="text-[15px] text-gray-500 leading-relaxed font-medium">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
