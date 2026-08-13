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
            {/* Both markers are flex items with a top margin rather than
                absolutes at a guessed `top`. The old values were set against a
                line box they no longer matched — the rule sat at 15px where
                the first line's optical centre is 24 — so both marks floated
                above their text. A margin of half the leading less half the
                mark centres them, and keeps centring them if the type changes.
                `items-start`, not `items-center`: on a row that wraps, the mark
                belongs beside the first line, not beside the middle of the
                block. */}
            <div className="rounded-[20px] bg-[#F7F8F9] p-7 sm:p-8">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">The old playbook</p>
              <ul className="flex flex-col">
                {ROWS.map(([before]) => (
                  <li
                    key={before}
                    className="flex items-start gap-3.5 border-b border-gray-200/70 py-3.5 text-[15px] font-medium leading-snug text-gray-400 last:border-0"
                  >
                    {/* 2px, not 1px, and a step darker. At a hairline it read
                        as a stray rule rather than as a minus against the dots
                        opposite. */}
                    <span aria-hidden className="mt-[9px] block h-[2px] w-3.5 shrink-0 rounded-full bg-gray-400" />
                    {before}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── What we do instead ────────────────────────────────────── */}
            {/* #39471D, the brand green, rather than the #E7ECD9 tint it wore.
                That tint is the one the palette reserves for fills on white and
                is explicitly too light to carry text; this panel is the answer
                to the one beside it and it should read as the darker, heavier
                object. Copy goes white and the label and dots go #CBD0AC —
                which is what that colour is for, and what the palette note in
                globals.css says: soft is for copy and rules ON olive. */}
            <div className="rounded-[20px] bg-[#39471D] p-7 sm:p-8">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#CBD0AC]">How we work</p>
              <ul className="flex flex-col">
                {ROWS.map(([, after]) => (
                  <li
                    key={after}
                    className="flex items-start gap-3.5 border-b border-white/15 py-3.5 text-[15px] font-semibold leading-snug text-white last:border-0"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] block h-[7px] w-[7px] shrink-0 rounded-full bg-[#CBD0AC]"
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
