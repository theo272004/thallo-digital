import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic } from '@/components/motion';

export default function CTASection() {
  return (
    <section className="bg-white py-24 border-b border-gray-100" id="cta">
      <div className="max-w-[1440px] mx-auto px-6 text-center">
        <Eyebrow center className="mb-5 justify-center">Get Audited</Eyebrow>
        <SplitReveal
          as="h2"
          className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
          html="Be the answer buyers <em>find first.</em>"
        />
        <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch] mx-auto mb-10">
          Start with a comprehensive AI visibility audit. We map your category, analyze your competitors, and lay out the exact roadmap to citation.
        </p>
        <Magnetic>
          <a
            href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
            className="px-8 py-4 bg-[#39471D] border border-[#39471D] rounded-[16px] text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all inline-flex items-center gap-2 shadow-md shadow-[#39471D]/10"
          >
            Book your strategy audit ↗
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
