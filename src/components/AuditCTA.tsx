'use client';

import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import PlanEnquiryForm from '@/components/PlanEnquiryForm';

/**
 * The closing photograph panel, with the enquiry form inside it.
 *
 * Every page used to end on the same photograph and then send you somewhere
 * else to write to us. The form belongs in the panel that does the asking, and
 * since that panel is the last thing on five different pages, it is one
 * component rather than five copies that drift apart.
 *
 * The panel keeps its original generosity — px-20 py-28 at desktop, a 6xl
 * heading. Squeezing those to make room for the form is what made the form
 * look cramped: the fix is a taller panel, not a smaller headline.
 */

/** The plans a visitor can ask about from anywhere on the site. */
export const ENQUIRY_PLANS = [
  'AI Visibility Audit',
  'The Authority Engine',
  'Flagship Projects',
];

type Props = {
  id?: string;
  image?: string;
  eyebrow: string;
  /** Plain heading. Use `headingSlot` instead when it needs its own markup. */
  heading?: string;
  /** For a heading that carries emphasis or its own reveal animation. */
  headingSlot?: React.ReactNode;
  copy: React.ReactNode;
  plans?: string[];
  /** Anything already selected elsewhere on the page, pre-ticked in the form. */
  activePlans?: string[];
  /** For photographs whose left side is lit, where white type needs holding down. */
  scrim?: boolean;
};

export default function AuditCTA({
  id = 'enquiry',
  image = '/thallo-digital/cta-bg.webp',
  eyebrow,
  heading,
  headingSlot,
  copy,
  plans = ENQUIRY_PLANS,
  activePlans,
  scrim = false,
}: Props) {
  return (
    <section className="bg-white py-20 2xl:py-24 border-b border-gray-100" id={id}>
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        <div className="relative overflow-hidden rounded-[28px] px-8 py-14 sm:px-16 sm:py-20 lg:px-20 lg:py-28">
          <img loading="lazy" decoding="async"
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ zIndex: 0 }}
          />

          {scrim && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[1] bg-gradient-to-r from-[#171A10]/55 via-[#171A10]/20 to-transparent"
            />
          )}

          {/* The form sits in the empty half of the photograph. Every one of
              these shots was composed with its subject to one side, which is
              the room this uses. */}
          <div className="relative z-[2] grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
            <div>
              <Eyebrow tone="light" className="mb-6">{eyebrow}</Eyebrow>
              {headingSlot ?? (
                <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans">
                  {heading}
                </h2>
              )}
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch]">
                {copy}
              </p>

              {/* These two navigate; the form beside them submits. Keeping them
                  here is what lets the form's own button say "Send message"
                  rather than borrowing this one's label. */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                <a
                  href="/thallo-digital/contact/"
                  className="inline-block w-full sm:w-auto text-center px-7 py-3.5 bg-white rounded-full text-sm font-semibold text-[#39471D] hover:bg-[#E7ECD9] transition-colors"
                >
                  Book an audit <ArrowUpRight className="ml-0.5" />
                </a>
                <a
                  href="/thallo-digital/thallo-ai/"
                  className="inline-block w-full sm:w-auto text-center px-7 py-3.5 border border-white/30 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Check my visibility <ArrowUpRight className="ml-0.5" />
                </a>
              </div>
            </div>

            <PlanEnquiryForm plans={plans} activePlans={activePlans} />
          </div>
        </div>
      </div>
    </section>
  );
}
