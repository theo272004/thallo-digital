'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';

/**
 * The old playbook against how we work.
 *
 * The one section on the page that names what it is arguing with. Everything
 * else says what Thallo does; this says what the alternative is and why it
 * stopped working, which is the objection every prospect arrives holding
 * whether or not they say it out loud.
 *
 * Two columns, and the left one is deliberately the weaker of the two
 * typographically — grey, lighter, marked with a dash rather than a dot. It is
 * the position being left behind, and setting it at equal weight would make
 * the table read as a menu of two valid options.
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
    <section className="bg-[#F7F8F3] py-16 2xl:py-28 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-6">
        <div
          className="rounded-[28px] border border-gray-200 bg-white px-7 py-12 sm:px-12 sm:py-14"
          style={{ boxShadow: '0 6px 20px -8px rgba(23,26,16,0.14)' }}
        >
          <SplitReveal
            as="h2"
            className="mb-4 max-w-[20ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
            html='Most agencies are still selling <span class="italic text-[#39471D]">the 2019 playbook.</span>'
          />
          <p className="mb-11 max-w-[52ch] text-base font-medium leading-relaxed text-gray-500">
            It was built for a search engine that sent people to websites. That&rsquo;s not the one your buyers are
            using anymore.
          </p>

          {/* The column headings are hidden on a phone, where the two sides
              stack and each row reads as a pair on its own. A sticky header for
              a two-item list is chrome nobody needs. */}
          <div className="hidden grid-cols-2 gap-10 border-b border-gray-200 pb-4 sm:grid">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">The old playbook</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#39471D]">How we work</span>
          </div>

          <ul>
            {ROWS.map(([before, after]) => (
              <li
                key={after}
                className="grid grid-cols-1 gap-2.5 border-b border-gray-200 py-5 last:border-0 sm:grid-cols-2 sm:gap-10"
              >
                <span className="relative pl-7 text-[15.5px] font-medium leading-snug text-gray-400">
                  <span aria-hidden className="absolute left-0 top-[11px] block h-px w-3.5 bg-gray-300" />
                  {before}
                </span>
                <span className="relative pl-7 text-[15.5px] font-semibold leading-snug text-gray-900">
                  <span aria-hidden className="absolute left-0 top-[8px] block h-[7px] w-[7px] rounded-full bg-[#39471D]" />
                  {after}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
