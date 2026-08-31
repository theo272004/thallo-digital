import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal, Magnetic, scrollToEl } from '@/components/motion';
import { BASE } from '@/lib/site';

export default function HeroText() {
  return (
    <div className="hero-copy flex flex-col justify-center pr-10" style={{ zIndex: 10 }}>
      {/* Tagline — masked line reveal on load (transform-only keeps LCP fast) */}
      <SplitReveal
        as="h1"
        scroll={false}
        fade={false}
        className="hero-tagline font-extrabold text-gray-900 mb-8 2xl:mb-10"
        /* Three lines now instead of two, so the type stays hero-sized on a
           longer headline — the ceiling comes down from 4.6rem to keep the
           column from running under the phone. */
        style={{ fontSize: 'clamp(2.2rem, 3.7vw, 4.1rem)', lineHeight: '1.12', letterSpacing: '-0.03em' }}
        html={
          '<span class="block font-sans">Become the name</span>' +
          '<span class="block font-sans mt-2">your market</span>' +
          /* No secondary face and no second weight: the heading's own type,
             slanted. Italic is the whole of the emphasis — the line keeps the
             h1's font-extrabold by inheritance, which is the point. */
          '<span class="block mt-2 italic text-[#39471D]">can&rsquo;t stop citing.</span>'
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
        {/* The scan, not the audit form.
            The primary action off the hero is the thing that costs the reader
            nothing and answers the question the headline just raised. Booking
            is further down the page, once they have a reason to. */}
        <Magnetic>
          <a
            href={`${BASE}/thallo-ai/scan/`}
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#55672E]/10"
          >
            See how AI describes you
            <ArrowUpRight className="text-[11px] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </Magnetic>
        <a
          href="#approach"
          onClick={(e) => {
            e.preventDefault();
            scrollToEl('#approach');
          }}
          className="px-6 py-3.5 rounded-full text-xs font-bold text-gray-800 border border-gray-200 bg-white hover:border-gray-400 transition-all flex items-center gap-2"
        >
          How it works
          <span className="text-[11px] text-gray-500">▷</span>
        </a>
      </div>
    </div>
  );
}
