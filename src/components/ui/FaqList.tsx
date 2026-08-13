'use client';

import React, { useState } from 'react';

/**
 * The accordion, once, for both sets of questions on the site.
 *
 * ## Why it is a component and not a pattern
 *
 * There were two FAQs and they were drawn two different ways — one centred
 * with a circled plus that rotated to a cross, one left-ruled with a plus made
 * of two hairlines. Unifying them by hand fixed the symptom and left the cause:
 * two copies of the same twenty lines, free to drift again the next time either
 * page is touched. They cannot now, because there is one copy.
 *
 * What the pages keep is their own heading. The home's is a `SplitReveal` with
 * an italic clause; the plans page's is a plain `h2`. That is the real seam
 * between them — the list is the same object on both, the introduction is not.
 *
 * ## The open row
 *
 * Its title goes olive and its plus fills and turns, so the state is legible
 * from either half of the row rather than from the icon alone. `aria-expanded`
 * carries the same fact to anything not looking at colour.
 *
 * The panel animates on `grid-template-rows` 0fr → 1fr rather than a guessed
 * `max-height`. Too small a guess clips the longest answer; too large and every
 * shorter answer finishes early and then sits through the rest of the easing,
 * which is what makes an accordion feel like it is sticking.
 */

/** `a` is a node, not a string: the home's answers carry links and more than
    one paragraph, and the plans page's are plain strings, which are nodes too. */
export type FaqItem = { q: string; a: React.ReactNode };

export default function FaqList({
  items,
  /** Namespaces the `aria-controls` ids, so two lists on one page never collide. */
  idPrefix,
  /** Which row starts open. `null` for none. */
  initial = 0,
}: {
  items: readonly FaqItem[];
  idPrefix: string;
  initial?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(initial);

  return (
    <div className="border-t border-gray-200">
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="border-b border-gray-200">
            <button
              type="button"
              id={`${idPrefix}-q-${i}`}
              aria-expanded={isOpen}
              aria-controls={`${idPrefix}-a-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span
                className={`text-[17px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${
                  isOpen ? 'text-[#39471D]' : 'text-gray-900 group-hover:text-[#39471D]'
                }`}
              >
                {faq.q}
              </span>

              {/* A circled plus that fills and turns 45° into a cross. The
                  glyph is type rather than an icon file — one character, no
                  request, and it inherits the colour transition for free. */}
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen
                    ? 'rotate-45 border-[#39471D] bg-[#39471D] text-white'
                    : 'border-gray-200 text-gray-400 group-hover:border-[#55672E]/40 group-hover:text-[#39471D]'
                }`}
              >
                +
              </span>
            </button>

            <div
              id={`${idPrefix}-a-${i}`}
              role="region"
              aria-labelledby={`${idPrefix}-q-${i}`}
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[64ch] pb-7 text-[15.5px] font-medium leading-relaxed text-gray-500">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
