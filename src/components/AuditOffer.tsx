'use client';

import React from 'react';
import { scrollToEl, SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Start with clarity" — the audit, offered on the home page with its price.
 *
 * Added at Cami's request on 3 October 2026. Six of the audit's seven items:
 * her note says the home carries six and the full scope stays on /services/,
 * where "how to structure your site so authority compounds" is its own line —
 * here it is folded into the readability one.
 *
 * The price has to be the one Services.tsx, ServicesLanding.tsx and HomeFaq.tsx
 * quote. If the audit is repriced, all four move together.
 *
 * "Book the audit" scrolls to the form at the foot of the page rather than
 * leaving it: the line under the button promises a conversation, and that form
 * is where the conversation starts.
 *
 * On 5 October the solid olive panel became a photograph, blurred and darkened,
 * with the price on a glass card — the treatment the Engine row on /services/
 * uses. Cami did not like the flat green.
 */
const ITEMS = [
  'Your mention rate vs. your competitors',
  'What it says about you when it does',
  "The questions where they win and you don't",
  'Whether AI can read your site properly, and how to structure it so authority compounds',
  'The 20 sites you need to be on in your category',
  'A 90-day plan you can act on, in-house or with us',
];

export default function AuditOffer() {
  return (
    <section className="border-b border-gray-100 bg-white py-16 2xl:py-24" id="audit">
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#171A10] px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
          {/* The photograph, softened. scale-110 pushes the blur's faded
              edge outside the rounded corners. */}
          <img
            src={`${BASE}/engine-bg.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-110 select-none object-cover"
            style={{ filter: 'blur(6px)' }}
          />
          {/* Darkest on the left where the list is read. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(100deg, rgba(23,26,16,.88) 0%, rgba(23,26,16,.72) 55%, rgba(23,26,16,.55) 100%)' }}
          />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            <div>
              <SplitReveal
                as="h2"
                className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
                html='Start with <span class="italic text-[#CBD0AC]">clarity.</span>'
              />
              <p className="mt-6 max-w-[48ch] text-base font-medium leading-relaxed text-[#CBD0AC] sm:text-lg">
                Your buyers ask AI who to hire before they ever talk to you. Right now, you have no idea what it tells
                them. The audit fixes that.
              </p>

              <ul className="mt-8 flex flex-col">
                {ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3.5 border-b border-white/15 py-4 text-[15px] font-medium leading-snug text-white last:border-0"
                  >
                    <img
                      src={`${BASE}/isotipo.png`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="mt-[2px] block h-[15px] w-[15px] shrink-0 select-none object-contain"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.75 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Glass, as on the Engine row in /services/. */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-8 text-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#CBD0AC]">
                AI Visibility Audit
              </p>
              <p className="mt-5 font-sans text-6xl font-bold tracking-tight text-white tabular-nums">$1,000</p>
              <p className="mt-3 text-sm font-medium text-white/70">one time · yours to keep</p>
              <a
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToEl('#cta');
                }}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-bold text-[#39471D] transition-colors hover:text-[#171A10]"
              >
                Book the audit
              </a>
              <p className="mt-4 text-xs font-medium text-white/60">A conversation first. No purchase at this step.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
