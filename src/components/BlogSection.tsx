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
];

export default function BlogSection() {
  return (
    <section className="bg-gray-50/50 py-28 border-b border-gray-100" id="reviews">
      <div className="max-w-[1440px] mx-auto px-6">

        <div className="max-w-2xl mb-14">
          <Eyebrow className="mb-5">In their words</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans"
            html="Teams that became the answer."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              data-reveal
              className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 16 16" width="14" height="14" fill="#39471D">
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
