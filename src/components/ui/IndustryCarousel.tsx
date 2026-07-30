'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

/* Icons are drawn at 24px on a 1.7 stroke and inherit `currentColor`, so the
   card can tint them without six separate colour literals. */
const INDUSTRIES = [
  {
    title: 'Specialized software',
    desc: 'Category-defining SaaS where the winner is the name buyers already trust.',
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
        <path d="M9 20.5h6M12 17v3.5M9.5 8.5 7.5 10.5l2 2M14.5 8.5l2 2-2 2" />
      </>
    ),
  },
  {
    title: 'Fintech',
    desc: 'Where a wrong vendor is costly to unwind, and credibility clears the shortlist.',
    icon: (
      <>
        <path d="M3 9.5 12 4l9 5.5" />
        <path d="M5 9.5v9M19 9.5v9M9.5 12.5v6M14.5 12.5v6M3 20.5h18" />
      </>
    ),
  },
  {
    title: 'Health tech',
    desc: 'Regulated, high-stakes buying that rewards the best-documented source.',
    icon: (
      <>
        <path d="M3 12.5h3.5l2-4.5 3 9 2.5-6 1.5 3h5.5" />
      </>
    ),
  },
  {
    title: 'Professional services',
    desc: 'Expertise businesses that live or die on reputation and referral.',
    icon: (
      <>
        <rect x="2.5" y="7.5" width="19" height="12.5" rx="2.5" />
        <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M2.5 13h19" />
      </>
    ),
  },
  {
    title: 'Health & recovery',
    desc: 'Deeply researched, deeply personal decisions where trust is everything.',
    icon: (
      <>
        <path d="M12 20.5C8 17.5 4 14.8 4 10.9A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 8 2.9c0 3.9-4 6.6-8 9.6z" />
      </>
    ),
  },
  {
    title: 'Benefits & claims',
    desc: 'Complex, confusing choices where the clear, trusted guide wins.',
    icon: (
      <>
        <path d="M12 20.5s7.5-3.7 7.5-9.3V5.4L12 2.8 4.5 5.4v5.8c0 5.6 7.5 9.3 7.5 9.3z" />
        <path d="M9 11.5l2.2 2.2L15 10" />
      </>
    ),
  },
];

/* 5.5s a card: long enough to finish reading the description, which the old
   3s rotation did not allow. */
const DWELL_MS = 5500;
const FADE_MS = 420;

export default function IndustryCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Cross-fade out, swap, fade back in. */
  const goTo = useCallback((next: number | ((prev: number) => number)) => {
    setVisible(false);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setCurrent((prev) =>
        typeof next === 'function' ? next(prev) : next,
      );
      setVisible(true);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    /* Readers who asked for less motion get a static first card, not a
       slideshow they cannot stop. */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;

    const id = setInterval(
      () => goTo((prev) => (prev + 1) % INDUSTRIES.length),
      DWELL_MS,
    );
    return () => clearInterval(id);
  }, [goTo, paused]);

  useEffect(() => () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
  }, []);

  const item = INDUSTRIES[current];

  return (
    <div
      className="flex flex-col items-center gap-3.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="w-full max-w-[420px] min-h-[84px] flex items-center gap-4 rounded-[20px] border border-gray-100 bg-white px-5 py-4 text-left shadow-[0_10px_36px_-16px_rgba(23,26,16,0.22)]">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#E7ECD9] text-[#39471D] transition-[opacity,transform] duration-[420ms] ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
        </div>

        {/* aria-live so the rotation is announced rather than silently swapping. */}
        <div
          className="flex-1 transition-[opacity,transform] duration-[420ms] ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
          aria-live="polite"
        >
          <p className="text-[13px] font-bold leading-snug text-gray-900">
            {item.title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-gray-500">
            {item.desc}
          </p>
        </div>
      </div>

      {/* Dots double as controls — an auto-rotation you cannot steer is a
          nuisance on the one card you actually wanted to read. */}
      <div className="flex items-center gap-1.5">
        {INDUSTRIES.map((ind, i) => (
          <button
            key={ind.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={ind.title}
            aria-current={i === current}
            className="h-3 px-0.5 focus-visible:outline-none"
          >
            <span
              className="block h-[5px] rounded-full transition-all duration-[420ms] ease-out"
              style={{
                width: i === current ? 18 : 5,
                background: i === current ? '#39471D' : '#CBD0AC',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
