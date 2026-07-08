import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic } from '@/components/motion';

export default function CTASection() {
  return (
    <section className="bg-white py-16 2xl:py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="cta">
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        {/* Dark feature card — the isotipo sits tone-on-tone in the top-right,
            bleeding off the corner like a brand watermark */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#39471D] px-8 py-14 sm:px-14 sm:py-20">
          <img
            src="/thallo-digital/isotipo.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-20 -right-16 w-72 sm:w-96 rotate-[18deg] opacity-[0.1] pointer-events-none select-none"
            style={{ filter: 'brightness(0) invert(1)' }}
          />

          <div className="relative max-w-xl">
            <Eyebrow tone="light" className="mb-5">Ready?</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-6 font-sans"
              html="Be the answer buyers <em>find first.</em>"
            />
            <p className="text-[#CBD0AC] font-medium text-base leading-relaxed max-w-[45ch] mb-10">
              Start with an AI visibility audit. See exactly where you stand, and what it takes to lead.
            </p>
            <Magnetic>
              <a
                href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
                className="px-8 py-4 bg-white border border-white rounded-full text-xs font-bold text-[#39471D] hover:bg-[#DFFF3B] hover:border-[#DFFF3B] transition-all inline-flex items-center gap-2"
              >
                Book your audit →
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
