import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1">
          <a href="/thallo-digital/" className="inline-block mb-4">
            <img loading="lazy" decoding="async" src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-5 object-contain" />
          </a>
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-[28ch]">
            The AI visibility agency. We make our clients the name customers and algorithms trust —
            businesses, brands and local favourites alike.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2">Solutions</h4>
          <div className="flex flex-col text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/services/" className="py-2 hover:text-[#39471D]">AI Visibility Audit</a>
            <a href="/thallo-digital/services/" className="py-2 hover:text-[#39471D]">Authority Engine</a>
            <a href="/thallo-digital/services/" className="py-2 hover:text-[#39471D]">Flagship Projects</a>
            <a href="/thallo-digital/thallo-ai/" className="py-2 hover:text-[#39471D]">Visibility Check</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2">Industries</h4>
          {/* py-2 on each link keeps the visual rhythm while giving every row a
              ≥40px touch target — the 17px-tall links failed on phones. */}
          <div className="flex flex-col text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/industries/" className="py-2 hover:text-[#39471D]">Software &amp; SaaS</a>
            <a href="/thallo-digital/industries/" className="py-2 hover:text-[#39471D]">Ecommerce &amp; retail</a>
            <a href="/thallo-digital/industries/" className="py-2 hover:text-[#39471D]">Clinics &amp; health</a>
            <a href="/thallo-digital/industries/" className="py-2 hover:text-[#39471D]">Restaurants &amp; local</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2">Company</h4>
          <div className="flex flex-col text-[11px] text-gray-500 font-semibold">
            <a href="/thallo-digital/#about" className="py-2 hover:text-[#39471D]">About</a>
            <a href="/thallo-digital/#faq" className="py-2 hover:text-[#39471D]">FAQ</a>
            <a href="/thallo-digital/#contact" className="py-2 hover:text-[#39471D]">Contact</a>
            <a href="/thallo-digital/#contact" className="py-2 hover:text-[#39471D]">Book an audit</a>
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
