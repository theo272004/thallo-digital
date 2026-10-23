'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';

/* Real clients, real words. These six used to be invented — six plausible
   names with plausible titles at plausible companies, which is a fabricated
   endorsement on the page that asks for trust. What is here now is what three
   clients actually said, quoted as they wrote it. Nothing is added: no company
   names, because they were not given, and a role with an invented employer
   beside it is the same lie the invented names were.

   Three, not six. The carousel repeats the list to fill the track, so a
   shorter list scrolls the same — it just says it honestly. When a fourth
   review comes in, add it here and nothing else changes. */
const REVIEWS = [
  {
    quote:
      "We went with Thallo for an audit and to be honest we weren't really sure what to expect because there are so many AI generated audits out there now that have no professional input, but that wasn't the case here. The recommendations were excellent and we definitely want to keep working with them.",
    name: 'Andres S',
    role: 'General Manager',
    initials: 'AS',
  },
  {
    quote:
      'I like that they have a clear process for bringing SEO, content, and brand positioning together, so nothing feels disconnected like it has with other agencies we’ve worked with. They’re also very communicative, easy to work with, and they deliver on what they say.',
    name: 'Oscar S',
    role: 'Head of Marketing',
    initials: 'OS',
  },
  {
    quote:
      'We used to publish content without much of a strategy. Sometimes it worked, sometimes it didn’t. Once we decided to take organic growth more seriously and started working with Thallo, things became much more consistent. We’ve seen steady growth and we’re getting organic leads through the site. We’ve been really happy with the results.',
    name: 'John B',
    role: 'Co-Founder',
    initials: 'JB',
  },
];

// Each card floats through one full cycle in FLOAT_S seconds.
// Cards are phase-shifted evenly so they form a continuous wave.
const FLOAT_S    = 5;    // seconds per up→down→up cycle
const FLOAT_PX   = 14;   // amplitude in px
const N          = REVIEWS.length;

/* The track is the list repeated, and the scroll loops by sliding it exactly
   half its width — so the half has to be wider than the widest screen, or the
   loop runs out of cards and leaves a gap on the right before it snaps back.
   With six reviews two copies were enough by accident; with three they are
   not. This counts the copies instead of assuming them: `HALF` cards per half
   at 320px each (300 wide, 20 of gap) clears a 2560px display, and the number
   corrects itself if the list grows again. */
const CARD_PITCH = 320;
const HALF       = Math.max(2, Math.ceil(2600 / (N * CARD_PITCH)));

/* Speed, not duration. A fixed 44s was a duration for one particular track
   width; now that the width is computed, the same number would mean the cards
   drift past faster every time the list changes length. 44px a second is what
   44s over the old track worked out to, and it is what the section is tuned
   to read at. */
const SCROLL_S   = Math.round((N * HALF * CARD_PITCH) / 44);

export default function BlogSection() {
  const half  = Array.from({ length: HALF }, () => REVIEWS).flat();
  const track = [...half, ...half];

  return (
    <section className="bg-white py-20 2xl:py-24 border-b border-gray-100 overflow-hidden" id="reviews">
      <style>{`
        @keyframes review-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(-${FLOAT_PX}px); }
          50%       { transform: translateY(${FLOAT_PX}px); }
        }
        .review-track {
          animation: review-scroll ${SCROLL_S}s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans"
            html="Teams that became the answer."
          />
        </div>
      </div>

      {/* Full-width carousel */}
      <div className="relative overflow-hidden px-6">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
        />

        {/* Scrolling track — py-5 gives room for the float amplitude */}
        {/* items-stretch, not items-center: these quotes are real and so they
            are different lengths, and a row of cards each ending wherever its
            own text does reads as a layout accident. Equal height, text top,
            attribution pinned to the bottom. */}
        <div className="review-track flex gap-5 py-5 w-max items-stretch">
          {track.map((r, i) => {
            // Distribute phase evenly across N cards; negative delay = pre-run the animation
            const delay = -((i % N) * FLOAT_S / N).toFixed(3);
            return (
              <div
                key={i}
                /* Only the first copy of each quote is read out. The rest
                   exist so the loop never shows a gap; to a screen reader, or
                   to an agent reading the accessibility tree, they are the same
                   three testimonials said again and again. */
                aria-hidden={i >= N || undefined}
                className="w-[300px] flex-shrink-0 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-5 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]"
                style={{
                  animation: `card-float ${FLOAT_S}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
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
                  <div aria-hidden className="w-8 h-8 rounded-full bg-[#39471D]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#39471D]">{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-900 leading-none">{r.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{r.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
