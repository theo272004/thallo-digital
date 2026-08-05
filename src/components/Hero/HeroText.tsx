import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal, Magnetic, scrollToEl } from '@/components/motion';

export default function HeroText() {
  return (
    <div className="hero-copy flex flex-col justify-center pr-10" style={{ zIndex: 10 }}>
      {/* Tagline — masked line reveal on load (transform-only keeps LCP fast) */}
      <SplitReveal
        as="h1"
        scroll={false}
        fade={false}
        className="hero-tagline font-extrabold text-gray-900 mb-8 2xl:mb-10 select-none"
        /* Three lines now instead of two, so the type stays hero-sized on a
           longer headline — the ceiling comes down from 4.6rem to keep the
           column from running under the phone. */
        style={{ fontSize: 'clamp(2.2rem, 3.7vw, 4.1rem)', lineHeight: '1.12', letterSpacing: '-0.03em' }}
        html={
          '<span class="block font-sans">Become the name</span>' +
          '<span class="block font-sans mt-2">your market</span>' +
          /* The heading face, italic and light. A serif italic here read as a
             second voice; Inter at 300 against the 800 above it leans without
             changing who is speaking. font-light has to be set on the span —
             the h1 carries font-extrabold, and weight inherits. */
          '<span class="block mt-2 font-sans font-light italic text-[#39471D]">can&rsquo;t stop citing.</span>'
        }
      />

      {/* Lede */}
      <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[42ch] mb-10 2xl:mb-12">
        In high-consideration industries, buyers decide who they trust long before they talk to anyone. We make sure
        that when they research, <strong className="text-gray-900 font-bold">the name they find as the reference is
        yours</strong>.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4">
        <Magnetic>
          <a
            href="#cta"
            onClick={(e) => {
              e.preventDefault();
              scrollToEl('#cta');
            }}
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#55672E]/10"
          >
            Book an AI visibility audit
            <ArrowUpRight className="text-[11px] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </Magnetic>
        {/* Points at the approach section: the plans teaser this used to scroll
            to no longer lives on the home page. */}
        <a
          href="#approach"
          onClick={(e) => {
            e.preventDefault();
            scrollToEl('#approach');
          }}
          className="px-6 py-3.5 rounded-full text-xs font-bold text-gray-800 border border-gray-200 bg-white hover:border-gray-400 transition-all flex items-center gap-2"
        >
          See how it works
          <span className="text-[11px] text-gray-500">▷</span>
        </a>
      </div>
    </div>
  );
}
