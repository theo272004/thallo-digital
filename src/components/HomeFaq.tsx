'use client';

import React from 'react';
import { SplitReveal } from '@/components/motion';
import FaqList from '@/components/ui/FaqList';
import { BASE } from '@/lib/site';

/**
 * The questions people ask before the first call.
 *
 * Deliberately the awkward ones — what it costs, how long it takes, what
 * happens if it doesn't work — answered plainly and early. A page that only
 * answers the comfortable questions leaves the others to be asked on a call,
 * where the honest answer is more expensive to give and less likely to be
 * believed.
 *
 * The plans page has its own set. That one is about choosing between three
 * offers; this one is about whether to talk to us at all, and the two should
 * not be the same list.
 */

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How long before we start seeing results?',
    a: (
      <>
        The visibility baseline lands in the first two weeks, so you know where you stand almost immediately. Movement
        in how the models describe you typically shows up between month three and month six, depending on how much
        ground your category already has covered. Anyone promising results in thirty days is selling you something
        else.
      </>
    ),
  },
  {
    q: 'We already have a marketing team. Where do you fit?',
    a: (
      <>
        Most of our clients do. The gap is rarely people, it&rsquo;s the specific combination of original research,
        technical structure and distribution run as one operation. Your team keeps owning the brand and the demand
        side. We own the authority engine and report into whoever you decide.
      </>
    ),
  },
  {
    q: 'Why not just run ads?',
    a: (
      <>
        <span className="block">
          Run both if the numbers work. But they do different jobs. Ads rent attention and stop the day the card stops.
          Authority is an asset you keep: the study you published two years ago is still being cited today, and it cost
          you once.
        </span>
        <span className="mt-3 block">
          In high-consideration categories the buyer researches for weeks before talking to anyone. Ads can reach them.
          They rarely convince them.
        </span>
      </>
    ),
  },
  {
    q: 'What does it cost?',
    a: (
      /* Both numbers, not one and a shrug.
         This answer used to name the monthly figure and then say "plus a
         one-time setup" with no amount attached — which is the most expensive
         sentence on the page, because it lands at the exact moment someone is
         deciding whether to enquire and leaves them to imagine the number. The
         setup is the AI Visibility Audit, and Our Plans has priced it at $800
         from the day that page shipped; there was never a figure being
         withheld, only one that had not been carried across. Keep the two
         pages in step — if the audit is repriced, this line moves with it. */
      <>
        Plans start at $2,500 a month, on a three-month initial term, and scale with the size of the operation.
        Before that there&rsquo;s a one-time AI Visibility Audit from $800 — the baseline and the strategy, and
        yours to keep whether or not you carry on. Full breakdown on{' '}
        <a href={`${BASE}/services/`} className="font-semibold text-[#39471D] underline underline-offset-2">
          Our Plans
        </a>
        .
      </>
    ),
  },
  {
    q: 'How do you measure it?',
    a: (
      <>
        Two things. How often the models name you across a fixed set of buying questions in your category, tracked
        monthly against your competitors. And what actually reached pipeline, tied back to the work that influenced it.
      </>
    ),
  },
  {
    q: "What if it doesn't work?",
    a: (
      <>
        You&rsquo;ll know early, because the baseline gives us a number to move from month one. If it isn&rsquo;t
        moving, we tell you before you ask, and we either change the approach or tell you honestly that we&rsquo;re not
        the right fit.
      </>
    ),
  },
];

export default function HomeFaq() {
  return (
    <section id="faq" className="border-b border-gray-100 bg-white py-16 2xl:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SplitReveal
              as="h2"
              className="mb-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
              html='Questions we get <span class="italic text-[#39471D]">before the first call.</span>'
            />
            <p className="max-w-[42ch] text-base font-medium leading-relaxed text-gray-500">
              {/* "below": the questions sit above the closing panel now, and
                  the enquiry form lives inside it. */}
              If yours isn&rsquo;t here, ask it in the form below and you&rsquo;ll get a straight answer.
            </p>
          </div>

          <FaqList items={FAQS} idPrefix="home-faq" />
        </div>
      </div>
    </section>
  );
}
