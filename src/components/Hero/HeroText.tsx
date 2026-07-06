import React from 'react';
import { SplitReveal, Magnetic, scrollToEl } from '@/components/motion';

export default function HeroText() {
  return (
    <div className="hero-copy flex flex-col justify-center pr-6" style={{ zIndex: 10 }}>
      {/* Tagline — masked line reveal on load (transform-only keeps LCP fast) */}
      <SplitReveal
        as="h1"
        scroll={false}
        fade={false}
        className="hero-tagline font-medium text-gray-900 mb-8 select-none"
        style={{ fontSize: 'clamp(3.1rem, 5.2vw, 5rem)', lineHeight: '1.06' }}
        html={
          '<span class="block font-sans">Be the answer</span>' +
          '<span class="block mt-2"><span class="inline-block font-serif italic text-[#39471D] bg-[#DFFF3B] px-3 py-0.5 rounded-full mr-1 leading-tight">AI</span><span class="font-sans">recommends.</span></span>'
        }
      />

      {/* Lede */}
      <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[44ch] mb-10">
        Your buyers ask AI before they ever ask you. Thallo builds the authority, infrastructure, and content that make
        your company the <strong className="text-gray-900 font-bold">trusted answer</strong>.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4 mb-16">
        <Magnetic>
          <a
            href="#cta"
            onClick={(e) => {
              e.preventDefault();
              scrollToEl('#cta');
            }}
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#39471D]/10"
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

      {/* Value nodes */}
      <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        <div data-reveal>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h5 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">AI Search Visibility</h5>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Show up in the answers that matter.</p>
        </div>

        <div data-reveal>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h5 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">Built on Authority</h5>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Content, data and signals AI can trust.</p>
        </div>

        <div data-reveal>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
          </div>
          <h5 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">Measurable Impact</h5>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">From citations to pipeline and revenue.</p>
        </div>
      </div>
    </div>
  );
}
