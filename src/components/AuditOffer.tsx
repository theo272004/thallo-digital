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
 */
const ITEMS = [
  "Your mention rate vs your competitors'",
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
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#39471D] px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
          {/* The isotipo, tone on tone and half cropped, as on the featured
              plan card in Services. */}
          <img
            src={`${BASE}/isotipo.png`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[340px] w-[340px] select-none opacity-[0.07]"
            style={{ filter: 'brightness(0) invert(1)' }}
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

            <div className="rounded-3xl bg-white p-8 text-center shadow-[0_30px_70px_-30px_rgba(23,26,16,0.6)] transition-transform duration-300 hover:-translate-y-1 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#55672E]">
                AI Visibility Audit
              </p>
              <p className="mt-5 font-sans text-6xl font-bold tracking-tight text-gray-900 tabular-nums">$1,200</p>
              <p className="mt-3 text-sm font-medium text-gray-500">one time · yours to keep</p>
              <a
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToEl('#cta');
                }}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#39471D] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#55672E]"
              >
                Book the audit
              </a>
              <p className="mt-4 text-xs font-medium text-gray-500">A conversation first. No purchase at this step.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
