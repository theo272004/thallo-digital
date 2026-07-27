import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic } from '@/components/motion';

export default function CTASection() {
  return (
    <section className="bg-white py-28 border-b border-gray-100" id="cta">
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">

          {/* Background photo — no effects */}
          <img loading="lazy" decoding="async"
            src="/thallo-digital/cta-bg.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ zIndex: 0 }}
          />

          <div className="relative z-[2] max-w-xl">
            <Eyebrow tone="light" className="mb-6">Ready?</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans"
              html="Be the answer buyers <em>find first.</em>"
            />
            <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch]">
              Start with an AI visibility audit. See exactly where you stand,
              and what it takes to lead.
            </p>

            {/* The form lives on its own page now — this is the home's way in. */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Magnetic>
                <a
                  href="/thallo-digital/contact/"
                  className="inline-block w-full sm:w-auto text-center px-7 py-3.5 bg-white rounded-full text-sm font-semibold text-[#39471D] hover:bg-[#E7ECD9] transition-colors"
                >
                  Book an audit ↗
                </a>
              </Magnetic>
              <a
                href="/thallo-digital/thallo-ai/"
                className="inline-block w-full sm:w-auto text-center px-7 py-3.5 border border-white/30 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Check my visibility ↗
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
