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
 * A band rather than a full section. It is a hand-off, not a chapter, and
 * giving it the height of one would break the argument either side of it.
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
          <div className="grid grid-cols-1 items-center gap-7 rounded-[20px] bg-[#171A10] px-8 py-10 sm:px-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
            <div>
              <h2 className="font-sans text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-[32px]">
                See how the models <span className="italic text-[#CBD0AC]">describe you.</span>
              </h2>
              <p className="mt-3 max-w-[62ch] text-[15.5px] font-medium leading-relaxed text-white/60">
                Run your brand against {QUESTION_COUNT} real buying questions across ChatGPT, Claude and Gemini.
                You&rsquo;ll see how often you&rsquo;re named, and who gets named instead. Free, no account, under a
                minute.
              </p>
            </div>

            <a
              href={`${BASE}/thallo-ai/`}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[13px] font-bold text-gray-900 transition-transform hover:-translate-y-px"
            >
              Run my scan
              <ArrowUpRight className="text-[11px] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
