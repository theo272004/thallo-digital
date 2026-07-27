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
        className="hero-tagline font-extrabold text-gray-900 mb-8 2xl:mb-10 select-none"
        style={{ fontSize: 'clamp(2.6rem, 4.2vw, 4.6rem)', lineHeight: '1.12', letterSpacing: '-0.03em' }}
        html={
          '<span class="block font-sans">Be the name</span>' +
          '<span class="block mt-2"><span class="font-serif italic text-[#39471D]">AI</span><span class="font-sans pl-4">recommends.</span></span>'
        }
      />

      {/* Lede */}
      <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[36ch] mb-10 2xl:mb-12">
        Your buyers ask ChatGPT, Perplexity, and Google before they ever ask you. Thallo makes sure the answer they get
        is your brand, built on <strong className="text-gray-900 font-bold">authority</strong> that compounds.
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
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#758061]/10"
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
