import React from 'react';

export default function CTASection() {
  return (
    <section className="bg-white py-24 border-b border-gray-100" id="cta">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]"></span>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">Get Audited</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 mb-6 font-sans">
          Be the answer buyers <em>find first.</em>
        </h2>
        <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[45ch] mx-auto mb-10">
          Start with a comprehensive AI visibility audit. We map your category, analyze your competitors, and lay out the exact roadmap to citation.
        </p>
        <a 
          href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
          className="px-8 py-4 bg-[#39471D] border border-[#39471D] rounded-[16px] text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all inline-flex items-center gap-2 shadow-md shadow-[#39471D]/10"
        >
          Book your strategy audit ↗
        </a>
      </div>
    </section>
  );
}
