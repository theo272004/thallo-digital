'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';
import SpinFlower from '@/components/ui/SpinFlower';
import { BASE } from '@/lib/site';

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
      {/* No card around any of this any more, and no flower hanging off its
          edge. A white card on a white ground was drawing an outline that
          separated nothing — the two panels inside it are the objects here, and
          a border around the pair only competed with them. What is left is the
          section's own ground, the words, and the two panels. */}
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        {/* Centred masthead. The heading used to sit left over a left-aligned
            paragraph with the two panels below it, which made the section read
            as a column with a table attached. Centred, the heading belongs to
            both panels equally — which is what a comparison needs. */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <SplitReveal
            as="h2"
            className="font-sans text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl"
            html='Most agencies are still selling <span class="italic text-[#39471D]">the 2019 playbook.</span>'
          />
          <p className="mx-auto mt-5 max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
            It was built for a search engine that sent people to websites. That&rsquo;s not the one your buyers are
            using anymore.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          {/* ── What everyone else still does ───────────────────────────── */}
          {/* Deliberately the weaker of the two: grey ground, grey type, a
              hollow ring for a marker. It is the position being left behind,
              and setting the two at equal weight would turn the comparison into
              a menu of two valid options.

              Every marker is a flex item with a top margin rather than an
              absolute at a guessed `top`, and the rows are `items-start`: on a
              row that wraps, the mark belongs beside the first line rather than
              beside the middle of the block. */}
          <div className="rounded-[24px] border border-gray-200/80 bg-[#F7F8F9] p-7 sm:p-9">
            <p className="mb-7 text-[12.5px] font-bold text-gray-500">Other agencies</p>
            <ul className="flex flex-col">
              {ROWS.map(([before]) => (
                <li
                  key={before}
                  className="flex items-start gap-3.5 border-b border-gray-200/70 py-4 text-[14.5px] font-medium leading-snug text-gray-500 last:border-0"
                >
                  <span
                    aria-hidden
                    className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-gray-300"
                  >
                    <span className="block h-[1.5px] w-[7px] rounded-full bg-gray-400" />
                  </span>
                  {before}
                </li>
              ))}
            </ul>
          </div>

          {/* ── What we do instead ──────────────────────────────────────── */}
          <div className="relative isolate overflow-hidden rounded-[24px] bg-[#39471D] p-7 sm:p-9">
            {/* The light in the corner is a photograph rather than a gradient:
                the boardroom shot, which is dark down its left and carries a lit
                wall and window on its right, turned up into the corner and faded
                out with a radial mask. A flat glow would have been quicker and
                would not have been ours. `mix-blend-screen` so it adds light to
                the olive instead of covering it. */}
            <img
              src={`${BASE}/cta-bg.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute -right-10 -top-20 -z-10 h-[340px] w-[540px] select-none object-cover opacity-40 mix-blend-screen"
              style={{
                maskImage: 'radial-gradient(120% 100% at 76% 24%, #000 0%, rgba(0,0,0,.5) 46%, transparent 76%)',
                WebkitMaskImage: 'radial-gradient(120% 100% at 76% 24%, #000 0%, rgba(0,0,0,.5) 46%, transparent 76%)',
              }}
            />

            <p className="mb-7 flex items-center gap-2.5 text-[12.5px] font-bold text-[#CBD0AC]">
              <SpinFlower alt="" className="block h-[18px] w-[18px]" />
              Thallo Digital
            </p>
            <ul className="flex flex-col">
              {ROWS.map(([, after]) => (
                <li
                  key={after}
                  className="flex items-start gap-3.5 border-b border-white/15 py-4 text-[14.5px] font-semibold leading-snug text-white last:border-0"
                >
                  <span
                    aria-hidden
                    className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#CBD0AC]/50"
                  >
                    <span className="block h-[6px] w-[6px] rounded-full bg-[#CBD0AC]" />
                  </span>
                  {after}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The two panels stack on a phone, where "other agencies" and "Thallo
            Digital" become two lists one after the other rather than two columns
            to read across. The rows still pair up in order. */}
      </div>
    </section>
  );
}
