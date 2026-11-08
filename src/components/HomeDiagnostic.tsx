'use client';

import React, { useRef, useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal, scrollToEl } from '@/components/motion';

/**
 * "Where is your marketing getting stuck?"
 *
 * Cami's section of 7 November (thallo-marketing-diagnostic-section.html),
 * placed where she asked, straight under the video. Her file's own note
 * suggested after Show Buyers; her message said under the video, and that is
 * what the page follows.
 *
 * The words are the file's, unchanged. The look is the site's rather than
 * the file's: the heading is every h2, the three situations take the item
 * title size with the olive underline the file drew, the answers are body
 * text, and the call to action is the same olive pill as "Discuss A
 * Project", pointing at the closing panel's form instead of /contact/ (the
 * file said to swap in the home's contact anchor).
 *
 * All three answers sit in one grid cell, only the chosen one visible, so the
 * section is always as tall as the longest and nothing below it jumps when
 * the choice changes. Tabs work by click and by arrow keys, as in the file.
 */

type Situation = { id: string; label: string; body: [string, string] };

const SITUATIONS: Situation[] = [
  {
    id: 'inquiries',
    label: 'Not Enough Qualified Leads',
    body: [
      'We’d start by defining the clients and engagements you want more of, then examine where your strongest opportunities come from and how they progress. That means reviewing referrals, direct outreach and digital channels, alongside how competing firms position themselves and reach similar buyers.',
      'The findings help us identify what’s attracting a poor fit, where relevant demand is being missed and which changes to your targeting, website or distribution deserve priority.',
    ],
  },
  {
    id: 'visibility',
    label: 'Weak Differentiation',
    body: [
      'We’d combine buyer interviews with a review of sales conversations, proposals and won, lost or stalled opportunities. We’d examine the alternatives buyers considered, what influenced their decisions and where your team had to explain value your marketing hadn’t communicated.',
      'Those findings guide the evidence, comparisons and explanations your website and sales materials need, helping buyers evaluate your expertise and giving your team stronger support throughout the sales process.',
    ],
  },
  {
    id: 'delivery',
    label: 'Inconsistent Execution',
    body: [
      'We’d review what’s preventing delivery and whether the current plan reflects the services you want to grow. That includes how priorities are set, how experts contribute and how marketing coordinates with the people responsible for winning business.',
      'We’d then establish a focused program with clear ownership, review points and a realistic delivery schedule. Your team provides its expertise and approves the substance; we manage the agreed work and use feedback from sales to keep it relevant.',
    ],
  },
];

export default function HomeDiagnostic() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (i: number, focus = false) => {
    const n = (i + SITUATIONS.length) % SITUATIONS.length;
    setActive(n);
    if (focus) tabRefs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: SITUATIONS.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    pick(map[e.key], true);
  };

  return (
    <section
      id="diagnostic"
      aria-labelledby="diagnostic-heading"
      className="border-b border-gray-100 bg-white py-24 2xl:py-28"
    >
      <div className="mx-auto max-w-[90rem] xl:max-w-[min(90rem,80vw)] px-6">
        <SplitReveal
          as="h2"
          id="diagnostic-heading"
          className="mx-auto max-w-[22ch] text-center font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl text-balance"
          html='Where Is Your Marketing <span class="block italic text-[#39471D]">Getting Stuck?</span>'
        />

        <div className="mx-auto mt-12 max-w-[70rem]">
          {/* The three situations. A row with an olive underline under the
              chosen one on a desktop; a list on a phone. */}
          <div
            role="tablist"
            aria-label="Choose your marketing situation"
            className="grid grid-cols-1 sm:grid-cols-3 sm:gap-8"
          >
            {SITUATIONS.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`diagnostic-tab-${s.id}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`diagnostic-panel-${s.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`group relative border-b border-gray-200 py-4 text-left text-lg font-bold leading-snug transition-colors duration-300 sm:pb-5 sm:pt-0 sm:text-center text-balance ${
                    on ? 'text-[#39471D]' : 'text-gray-500 hover:text-[#39471D]'
                  }`}
                >
                  {s.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 -bottom-px h-[3px] origin-left bg-[#39471D] transition-transform duration-300 ${
                      on ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Every answer in the same cell: the tallest sets the height. */}
          <div className="mx-auto mt-10 grid max-w-[50rem]">
            {SITUATIONS.map((s, i) => {
              const on = i === active;
              return (
                <div
                  key={s.id}
                  id={`diagnostic-panel-${s.id}`}
                  role="tabpanel"
                  aria-labelledby={`diagnostic-tab-${s.id}`}
                  aria-hidden={!on}
                  className={`[grid-area:1/1] flex flex-col gap-4 transition-[opacity,transform] duration-300 ${
                    on ? 'opacity-100 translate-y-0' : 'pointer-events-none invisible opacity-0 translate-y-1'
                  }`}
                >
                  {s.body.map((p) => (
                    <p key={p.slice(0, 24)} className="text-base font-medium leading-relaxed text-gray-500">
                      {p}
                    </p>
                  ))}
                </div>
              );
            })}

            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToEl('#cta');
              }}
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#39471D] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#55672E]"
            >
              Discuss Your Situation
              <ArrowUpRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
