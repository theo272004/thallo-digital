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
 * `notebook-desk.webp` — the flower embossed on a notebook, a mug, leaves. It
 * was shot for this site and had been orphaned in `public/` since the section
 * that used it was rewritten. Every dark panel on this site is image-backed
 * (`cta-bg`, `shift`, `results-bg`, `contact-bg`); a flat ink rectangle was the
 * only one of its kind and read as unfinished next to them.
 *
 * Like every other shot here it is composed with its subject to one side, and
 * the copy sits in the empty half. The scrim is a left-to-right gradient rather
 * than a flat overlay for the same reason: it darkens the side carrying text
 * and leaves the photograph alone where the photograph is the point.
 */
export default function ScannerStripe() {
  return (
    <section className="bg-white py-10 2xl:py-14">
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
              src={`${BASE}/notebook-desk.webp`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              style={{ zIndex: 0 }}
            />

            {/* Checked rather than assumed: white on the photograph's own left
                edge is around 4:1, which is under AA for body text. The scrim
                takes it past 12:1 and stops before the notebook. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[1] bg-gradient-to-r from-[#171A10]/92 via-[#171A10]/70 to-transparent"
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
                  {`Run your brand against ${QUESTION_COUNT} real buying questions across ChatGPT, Claude and Gemini. `}
                  You&rsquo;ll see how often you&rsquo;re named, and who gets named instead. Free, no account, under a
                  minute.
                </p>
              </div>

              <a
                href={`${BASE}/thallo-ai/`}
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
