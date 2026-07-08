import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic } from '@/components/motion';

export default function CTASection() {
  return (
    <section className="bg-white py-16 2xl:py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="cta">
      <div className="max-w-[1440px] mx-auto px-6 text-center">
        <Eyebrow center className="mb-5 justify-center">Ready?</Eyebrow>
        <SplitReveal
          as="h2"
          className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
          html="Be the answer buyers <em>find first.</em>"
        />
        <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch] mx-auto mb-10">
          Start with an AI visibility audit. See exactly where you stand, and what it takes to lead.
        </p>
        <Magnetic>
          <a
            href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
            className="px-8 py-4 bg-[#39471D] border border-[#39471D] rounded-full text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all inline-flex items-center gap-2 shadow-md shadow-[#39471D]/10"
          >
            Book your audit ↗
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
