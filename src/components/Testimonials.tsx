'use client';

import React from 'react';

const ARTICLES = [
  {
    badge: 'GEO',
    date:  'June 2026',
    read:  '7 min',
    title: 'What "share of answer" really measures',
    desc:  'And why it matters more than rankings now.',
  },
  {
    badge: 'Content',
    date:  'May 2026',
    read:  '5 min',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate.",
  },
  {
    badge: 'Strategy',
    date:  'May 2026',
    read:  '6 min',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention vs. owning credibility.',
  },
  {
    badge: 'AI',
    date:  'April 2026',
    read:  '4 min',
    title: 'How ChatGPT decides who to recommend',
    desc:  'The signals that put your brand in the answer.',
  },
  {
    badge: 'B2B',
    date:  'April 2026',
    read:  '8 min',
    title: 'The trust deficit in high-consideration buying',
    desc:  'Why buyers do so much research before they ever reach out.',
  },
  {
    badge: 'GEO',
    date:  'March 2026',
    read:  '5 min',
    title: 'Citations over clicks: the new metric',
    desc:  "What gets you cited by AI is different from what gets you ranked.",
  },
];

// Alternating up/down offset per card position
const Y_OFFSETS = [-16, 16, -16, 16, -16, 16];

export default function Testimonials() {
  // Duplicate cards for seamless infinite loop
  const track = [...ARTICLES, ...ARTICLES];

  return (
    <section className="bg-white py-28 border-b border-gray-100 overflow-hidden" id="testimonials">
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 38s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6">

        {/* ── Featured card + carousel ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">

          {/* Featured card — static, left side */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#1a1f10] min-h-[380px] lg:min-h-[440px] w-full lg:w-[320px] xl:w-[360px] flex-shrink-0">
            <img
              src="/thallo-digital/shift.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Eyebrow */}
            <div className="absolute top-8 sm:top-10 left-8 sm:left-10 z-10 flex items-center gap-2.5">
              <span className="w-5 h-px bg-white/40 flex-shrink-0" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                From the field
              </span>
            </div>

            {/* Heading */}
            <div className="absolute bottom-8 sm:bottom-10 left-8 sm:left-10 right-8 sm:right-10 z-10">
              <h2 className="text-2xl sm:text-[2rem] font-bold text-white leading-tight">
                Notes on getting found,<br />and trusted.
              </h2>
            </div>
          </div>

          {/* Infinite carousel — flex-1, clips overflow */}
          <div className="flex-1 overflow-hidden relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, white, transparent)' }} />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, white, transparent)' }} />

            {/* Scrolling track — py-6 gives room for the Y offsets */}
            <div className="marquee-track flex gap-5 py-6 w-max">
              {track.map((a, i) => (
                <div
                  key={i}
                  className="w-[248px] flex-shrink-0 border border-gray-100 rounded-3xl p-6 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between"
                  style={{ transform: `translateY(${Y_OFFSETS[i % ARTICLES.length]}px)` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#39471D] bg-[#39471D]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {a.badge}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                        {a.date} · {a.read}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">{a.title}</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{a.desc}</p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#39471D]"
                  >
                    Read →
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
