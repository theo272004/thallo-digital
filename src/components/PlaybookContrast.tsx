'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';
import SpinFlower from '@/components/ui/SpinFlower';

/**
 * The old playbook against how we work.
 *
 * The one section on the page that names what it is arguing with. Everything
 * else says what Thallo does; this says what the alternative is and why it
 * stopped working, which is the objection every prospect arrives holding
 * whether or not they say it out loud.
 *
 * ## The two columns are not equals
 *
 * The left one is deliberately the weaker of the two: grey, lighter, struck
 * through with a hairline, marked with a dash. It is the position being left
 * behind, and setting the two at equal weight would turn the table into a menu
 * of two valid options — which is the opposite of the argument.
 *
 * The right column sits on the olive tint, so the difference is visible before
 * a single row is read. A table where the answer is only findable by reading
 * both halves is a table most people skim past.
 *
 * ## House style, not the mockup's
 *
 * The approved mockup is drawn in a different palette from the live site — a
 * cooler forest green on a warm paper ground. The words are taken from it; the
 * material is the site's own: the 28px card radius, the one house shadow, the
 * isotipo. A section that matched the mockup's colours exactly would be the
 * only one on the page that did.
 *
 * The ground itself is white. It was the `#F7F8F9` tint, which put it directly
 * under the equally tinted shift section — the card inside keeps its own white
 * and its border, so the panel still reads as an object on the page.
 */

const ROWS: [string, string][] = [
  ['Publish on a keyword and hope it ranks.', 'Own a question with research nobody else could run.'],
  ['Report traffic and rankings.', 'Report who the models name, and what reached pipeline.'],
  ['Optimize for Google alone.', 'Structure for the models buyers actually ask first.'],
  ['More posts, more words, more volume.', 'Fewer pieces, each one worth citing.'],
  ['Hand over a strategy and let you execute it.', 'Run the operation, from research to distribution.'],
];

export default function PlaybookContrast() {
  return (
    /* White ground; the hairline underneath carries it into the approach
       section. */
    <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
      <div className="mx-auto max-w-[1440px] px-6">
        <div
          data-reveal
          className="relative rounded-[28px] border border-gray-200 bg-white px-6 pb-4 pt-12 sm:px-12 sm:pt-14"
          style={{ boxShadow: '0 6px 20px -8px rgba(23,26,16,0.14)' }}
        >
          {/* The mark hangs off the card's left edge, as it does on the plans
              page. Desktop only — at narrow widths there is no margin for it to
              hang into and it would sit on top of the heading. */}
          <SpinFlower
            alt="Thallo"
            className="absolute left-0 top-14 z-10 -ml-3 hidden h-[68px] w-[68px] -translate-x-full lg:block"
          />

          <SplitReveal
            as="h2"
            className="mb-4 max-w-[20ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
            html='Most agencies are still selling <span class="italic text-[#39471D]">the 2019 playbook.</span>'
          />
          <p className="mb-10 max-w-[54ch] text-base font-medium leading-relaxed text-gray-500">
            It was built for a search engine that sent people to websites. That&rsquo;s not the one your buyers are
            using anymore.
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            {/* ── What everyone else still does ─────────────────────────── */}
            <div className="rounded-[20px] bg-[#F7F8F9] p-7 sm:p-8">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">The old playbook</p>
              <ul className="flex flex-col">
                {ROWS.map(([before]) => (
                  <li
                    key={before}
                    className="relative border-b border-gray-200/70 py-3.5 pl-7 text-[15px] font-medium leading-snug text-gray-400 last:border-0"
                  >
                    <span aria-hidden className="absolute left-0 top-[15px] block h-px w-3.5 bg-gray-300" />
                    {before}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── What we do instead ────────────────────────────────────── */}
            <div className="rounded-[20px] bg-[#E7ECD9] p-7 sm:p-8">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#39471D]">How we work</p>
              <ul className="flex flex-col">
                {ROWS.map(([, after]) => (
                  <li
                    key={after}
                    className="relative border-b border-[#39471D]/12 py-3.5 pl-7 text-[15px] font-semibold leading-snug text-gray-900 last:border-0"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[17px] block h-[7px] w-[7px] rounded-full bg-[#39471D]"
                    />
                    {after}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The two panels stack on a phone, where "the old playbook" and
              "how we work" become two lists one after the other rather than two
              columns to read across. The rows still pair up in order. */}
          <div className="h-8" />
        </div>
      </div>
    </section>
  );
}
