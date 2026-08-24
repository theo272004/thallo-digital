'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';
import { QUESTION_COUNT } from '@/lib/scan/questions';

/**
 * The scanner, offered once, in the middle of the page.
 *
 * It sits directly after the Authority Engine on purpose: the engine has just
 * described what the work is, and the obvious next thought is "where do I
 * actually stand". This answers it in a minute, for nothing, without a form —
 * which makes it the cheapest possible next step for someone who is interested
 * but not yet ready to talk to anybody.
 *
 * ## The photograph
 *
 * `scanner-bg.webp` — the stone flower, the vase, the notepad with the isotipo
 * blind-embossed on it. Chosen by Cami and converted from a 1.6 MB PNG to a
 * 63 KB WebP at quality 88, which is in line with the other photographs here
 * (50–75 KB) and high enough that the dark gradient filling most of the frame
 * does not band — which is exactly where a cheaper encode would show.
 *
 * Every dark panel on this site is image-backed (`cta-bg`, `shift`,
 * `results-bg`, `contact-bg`); a flat ink rectangle was the only one of its
 * kind and read as unfinished beside them.
 *
 * ## The scrim, sized from measurements rather than from habit
 *
 * The left of this frame is close to black — rgb(16,16,7). Sampled across the
 * width the text actually occupies, white lands at 18:1 at a third of the way
 * across and is still 11.9:1 at 62%; the olive-soft the paragraph uses is
 * 11.3:1 and 7.5:1 at the same points. All of that clears AA several times
 * over, and most of it clears AAA, with no overlay at all.
 *
 * So the desktop scrim is almost nothing — a safety margin, not a fix — and it
 * fades out well before the flower. An earlier version of this file carried a
 * heavy gradient justified by a "roughly 4:1" figure that had been assumed
 * rather than measured; measuring it gave 16.6:1, and the overlay had been
 * flattening the photograph to solve a problem that was not there.
 *
 * Below `lg` the panel is narrow, `object-cover` crops the frame towards its
 * middle, and the copy really can end up over the lit part of the desk. That
 * case gets its own flat scrim.
 */
export default function ScannerStripe() {
  return (
    /* The house tint, #F7F8F9 — the same grey the blog section below carries.
       The hairline is new and is doing real work here: this is the one join on
       the page where two tinted sections meet, and without a rule the two
       grounds run together into one long band with a photograph floating in
       the middle of it. */
    /* Padding is asymmetric on purpose: the bottom is cut back so the blog
       sits close under this. The two share a ground and a hairline and read as
       one run of the page, and 40px under here plus 64px over there was
       holding them apart as though they were unrelated. */
    <section className="border-b border-gray-100 bg-[#F7F8F9] pt-10 pb-6 2xl:pt-14 2xl:pb-8">
      <div className="mx-auto max-w-[1440px] px-6">
        {/* `data-reveal`, not the Reveal component. The page root already runs
            useRevealBatch, which is how every other section here fades in;
            Reveal is a second mechanism doing the same job and nothing else in
            this codebase uses it. One way in is easier to trust than two. */}
        <div data-reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-[#171A10] px-8 py-11 sm:px-12 sm:py-12 lg:px-16">
            <img
              loading="lazy"
              decoding="async"
              src={`${BASE}/scanner-bg.webp`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              style={{ zIndex: 0 }}
            />

            {/* Narrow screens: the frame is cropped towards its middle and the
                copy can land on the lit part of the desk. Flat, and only here. */}
            <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[#171A10]/70 lg:hidden" />

            {/* Wide screens: a margin, not a fix. The measurements are in the
                note at the top of this file — the type clears AA several times
                over unaided, so this fades out before it reaches the flower. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[1] hidden bg-gradient-to-r from-[#171A10]/70 via-[#171A10]/15 to-transparent lg:block"
            />

            <div className="relative z-[2] grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
              <div>
                <h2 className="font-sans text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-[34px]">
                  See how the models <span className="italic text-[#CBD0AC]">describe you.</span>
                </h2>
                {/* The count and the word after it are one template string on
                    purpose. Written as `{COUNT} real`, JSX drops the space
                    whenever a formatter rewraps the line so the expression ends
                    it — which is exactly what shipped: "against 15real buying
                    questions". A template literal cannot lose it. */}
                <p className="mt-4 max-w-[54ch] text-[15.5px] font-medium leading-relaxed text-[#CBD0AC]">
                  {`Run your brand against up to ${QUESTION_COUNT} real buying questions across ChatGPT, Claude and Gemini. `}
                  You&rsquo;ll see how often you&rsquo;re named, and who gets named instead. Free, no account, under a
                  minute.
                </p>
              </div>

              <a
                href={`${BASE}/thallo-ai/scan/`}
                className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-8 py-4 text-[13px] font-bold text-gray-900 transition-transform hover:-translate-y-px lg:self-auto"
              >
                Run my scan
                <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
