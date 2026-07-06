import React from 'react';
import { SplitReveal, Magnetic, scrollToEl } from '@/components/motion';

export default function HeroText() {
  return (
    <div className="hero-copy flex flex-col justify-center pr-10" style={{ zIndex: 10 }}>
      {/* Tagline — masked line reveal on load (transform-only keeps LCP fast) */}
      <SplitReveal
        as="h1"
        scroll={false}
        fade={false}
        className="hero-tagline font-extrabold text-gray-900 mb-10 select-none"
        style={{ fontSize: 'clamp(3.4rem, 5.6vw, 5.5rem)', lineHeight: '1.02', letterSpacing: '-0.03em' }}
        html={
          '<span class="block font-sans">Be the answer</span>' +
          '<span class="block mt-2"><span class="inline-block font-serif italic text-white bg-[#758061] px-3 py-0.5 rounded-full mr-1 leading-tight">AI</span><span class="font-sans">recommends.</span></span>'
        }
      />

      {/* Lede */}
      <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[36ch] mb-12">
        Your buyers ask AI before they ever ask you. Thallo builds the authority, infrastructure, and content that make
        your company the <strong className="text-gray-900 font-bold">trusted answer</strong>.
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
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#758061] border border-[#758061] hover:bg-[#697357] hover:border-[#697357] transition-all flex items-center gap-2 group shadow-sm shadow-[#758061]/10"
          >
            Book an AI visibility audit
            <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
          </a>
        </Magnetic>
        <a
          href="#services"
          onClick={(e) => {
            e.preventDefault();
            scrollToEl('#services');
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
