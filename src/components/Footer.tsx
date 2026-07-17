import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16" id="contact">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1">
          <a href="/thallo-digital/" className="inline-block mb-4">
            <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-5 object-contain" />
          </a>
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-[28ch]">
            The AI visibility agency. We make our clients the name buyers and algorithms trust.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Solutions</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/services/" className="hover:text-[#39471D]">AI Visibility Audit</a>
            <a href="/thallo-digital/services/" className="hover:text-[#39471D]">Authority Engine</a>
            <a href="/thallo-digital/services/" className="hover:text-[#39471D]">Flagship Projects</a>
            <a href="/thallo-digital/thallo-ai/" className="hover:text-[#39471D]">Visibility Check</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Industries</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/industries/" className="hover:text-[#39471D]">Fintech</a>
            <a href="/thallo-digital/industries/" className="hover:text-[#39471D]">Health tech</a>
            <a href="/thallo-digital/industries/" className="hover:text-[#39471D]">Professional services</a>
            <a href="/thallo-digital/industries/" className="hover:text-[#39471D]">Health &amp; recovery</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Company</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/" className="hover:text-[#39471D]">About</a>
            <a href="/thallo-digital/#blog" className="hover:text-[#39471D]">Blog</a>
            <a href="/thallo-digital/#contact" className="hover:text-[#39471D]">Contact</a>
            <a href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" className="hover:text-[#39471D]">Book an audit</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 border-t border-gray-50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono tracking-wider text-gray-400">
        <span>© 2026 Thallo Digital. All rights reserved.</span>
        <span>LinkedIn · X · hello@thallo.co</span>
      </div>
    </footer>
  );
}
