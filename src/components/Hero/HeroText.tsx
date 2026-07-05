import React from 'react';

export default function HeroText() {
  return (
    <div className="hero-copy flex flex-col justify-center pr-8" style={{ zIndex: 10 }}>
      {/* Eyebrow Label */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]"></span>
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">
          AI Visibility Agency
        </span>
      </div>

      {/* Tagline */}
      <h1 className="hero-tagline font-medium text-gray-900 mb-8 select-none" style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', lineHeight: '1.25' }}>
        <span className="block font-sans">Be the answer</span>
        <span className="block mt-2">
          <span className="inline-block font-serif italic text-black bg-[#DFFF3B] px-3 py-0.5 rounded-[10px] mr-3">AI</span>
          <span className="font-sans">recommends.</span>
        </span>
      </h1>

      {/* Lede Copywriting */}
      <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[42ch] mb-10">
        Your buyers ask AI before they ever ask you. Thallo builds the authority, infrastructure, and content that make your company the <strong className="text-gray-900 font-bold">trusted answer</strong>.
      </p>

      {/* Large Rounded Minimal Buttons */}
      <div className="flex items-center gap-4 mb-16">
        <a 
          href="#cta" 
          onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="px-6 py-3.5 rounded-[16px] text-xs font-bold text-white bg-[#39471D] border border-[#39471D] hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center gap-2 group shadow-sm shadow-[#39471D]/10"
        >
          Book an AI visibility audit 
          <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
        <a 
          href="#services" 
          onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="px-6 py-3.5 rounded-[16px] text-xs font-bold text-gray-800 border border-gray-200 bg-white hover:border-gray-400 transition-all flex items-center gap-2"
        >
          See how it works 
          <span className="text-[10px] text-gray-500">▷</span>
        </a>
      </div>

      {/* Bottom Sub-Hero Value Nodes */}
      <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        <div>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            {/* Target Icon */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h5 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">
            AI Search Visibility
          </h5>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Show up in the answers that matter.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            {/* Shield Icon */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h5 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">
            Built on Authority
          </h5>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Content, data and signals AI can trust.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 mb-3 text-gray-800">
            {/* Graph Icon */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
          </div>
          <h5 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-1.5">
            Measurable Impact
          </h5>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            From citations to pipeline and revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
