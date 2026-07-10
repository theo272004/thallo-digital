'use client';

import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

const REVIEWS = [
  {
    quote: 'Within a quarter, we were the name coming up in ChatGPT for our category. Sales stopped having to explain who we were.',
    name: 'Dana Mercer',
    role: 'VP Marketing, Ledgerly',
    initials: 'DM',
  },
  {
    quote: "They didn't just publish more. They made the accurate version of our story the one the market and the AI actually find.",
    name: 'Raj Kapoor',
    role: 'Founder, Vireo Health',
    initials: 'RK',
  },
  {
    quote: 'The audit alone paid for itself. We finally saw exactly where we were invisible and why competitors were winning.',
    name: 'Elena Castro',
    role: 'CEO, Calderon & Co',
    initials: 'EC',
  },
  {
    quote: "Authority that compounds is real. Every month our content works harder, and it's not something a competitor can copy overnight.",
    name: 'Tom Nguyen',
    role: 'Head of Growth, Northwind',
    initials: 'TN',
  },
  {
    quote: 'We went from invisible to cited across three AI platforms in two months. The methodology is unlike anything we had tried before.',
    name: 'Priya Okafor',
    role: 'CMO, Meridian SaaS',
    initials: 'PO',
  },
  {
    quote: 'Our buyers kept referencing content that cited us. Thallo turned our expertise into the thing everyone in the room already knows.',
    name: 'James Wu',
    role: 'Co-Founder, Arcline Medical',
    initials: 'JW',
  },
  {
    quote: 'Skeptical going in, convinced coming out. Revenue from inbound increased 40% in the first six months.',
    name: 'Sofia Brennan',
    role: 'Director of Marketing, Fenwick Capital',
    initials: 'SB',
  },
];

// Alternating up / down per card position
const Y_OFFSETS = [-18, 18, -18, 18, -18, 18, -18];

export default function BlogSection() {
  const track = [...REVIEWS, ...REVIEWS];

  return (
    <section className="bg-gray-50/50 py-28 border-b border-gray-100 overflow-hidden" id="reviews">
      <style>{`
        @keyframes review-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .review-track {
          animation: review-scroll 42s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <Eyebrow className="mb-5">In their words</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans"
            html="Teams that became the answer."
          />
        </div>
      </div>

      {/* Full-width carousel — no max-width so cards bleed to screen edges */}
      <div className="relative overflow-hidden px-6">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }}
        />

        {/* Scrolling track — py-6 gives room for Y offsets */}
        <div className="review-track flex gap-5 py-6 w-max">
          {track.map((r, i) => (
            <div
              key={i}
              className="w-[300px] flex-shrink-0 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              style={{ transform: `translateY(${Y_OFFSETS[i % REVIEWS.length]}px)` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} viewBox="0 0 16 16" width="13" height="13" fill="#39471D">
                    <path d="M8 1l1.854 3.757L14 5.528l-3 2.924.708 4.128L8 10.5l-3.708 2.08L5 8.452 2 5.528l4.146-.771L8 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-700 font-medium leading-relaxed flex-1">
                &ldquo;{r.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#39471D]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#39471D]">{r.initials}</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-900 leading-none">{r.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
