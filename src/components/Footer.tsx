import React from 'react';
import { BASE, BLOG_URL } from '@/lib/site';

// `relative z-10` is load-bearing: /contact/ pins a photograph at z-index 0, and
// a static footer — however late in the document — paints underneath any
// positioned element. Without it the picture covers the whole footer.
export default function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-gray-100 py-16">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1">
          <a href={`${BASE}/`} className="inline-block mb-4">
            {/* Trimmed of its transparent margin, so h-5 is 20px of actual
                wordmark. width/height are the real ratio (7.09:1) — the box is
                reserved before the file lands, so the footer never reflows. */}
            <img
              loading="lazy"
              decoding="async"
              src={`${BASE}/logo-wordmark.png`}
              alt="Thallo Digital"
              width={900}
              height={127}
              className="h-5 w-auto object-contain"
            />
          </a>
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-[28ch]">
            The AI visibility agency. We make our clients the name buyers and algorithms trust.
          </p>
        </div>

        {/* "Plans", and the three names /services/ actually uses.

            This column was headed "Solutions" and listed a "Flagship Projects"
            that exists nowhere else on the site — /services/ calls it
            "Standalone Projects", the navbar calls the page "Our Plans", and
            the home FAQ called the same three things "engagements". Four words
            for one idea, and a reader who follows a footer link looking for
            "Flagship Projects" arrives on a page that has never heard of it.
            One vocabulary now: plans, and the names the plans are sold under. */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Plans</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href={`${BASE}/services/`} className="hover:text-[#39471D]">AI Visibility Audit</a>
            <a href={`${BASE}/services/`} className="hover:text-[#39471D]">The Authority Engine</a>
            <a href={`${BASE}/services/`} className="hover:text-[#39471D]">Standalone Projects</a>
            {/* "Visibility Tool", and it goes to the tool. It read "Visibility
                Check" and pointed at /thallo-ai/, the demo page that explained
                the scan — so the one footer link to the free thing led to a
                page about the free thing. The demo is hidden now and this is
                the scan itself. */}
            <a href={`${BASE}/thallo-ai/scan/`} className="hover:text-[#39471D]">Visibility Tool</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Industries</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href={`${BASE}/industries/`} className="hover:text-[#39471D]">Fintech</a>
            <a href={`${BASE}/industries/`} className="hover:text-[#39471D]">Health tech</a>
            <a href={`${BASE}/industries/`} className="hover:text-[#39471D]">Professional services</a>
            <a href={`${BASE}/industries/`} className="hover:text-[#39471D]">Health &amp; recovery</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-4">Company</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href={`${BASE}/about/`} className="hover:text-[#39471D]">About</a>
            {/* "The partners" pointed at #team on the about page, and that
                section is hidden — see AboutLanding. A link to an anchor that
                is no longer rendered scrolls nowhere and reads as a broken
                page, so it goes out with it and comes back with it. */}
            <a href={BLOG_URL} className="hover:text-[#39471D]">Blog</a>
            <a href={`${BASE}/contact/`} className="hover:text-[#39471D]">Contact</a>
            <a href={`${BASE}/contact/`} className="hover:text-[#39471D]">Book an audit</a>
          </div>
        </div>
      </div>

      {/* Legal strip. Its own row above the copyright rather than a fifth column:
          a payment processor reviewing the site looks for these three in the
          footer, and a reader looking for the refund window should not have to
          find it among the service links. */}
      <div className="max-w-[1440px] mx-auto px-6 border-t border-gray-100 pt-8 flex flex-wrap gap-x-7 gap-y-3">
        <a href={`${BASE}/terms/`} className="text-[11px] font-semibold text-gray-500 hover:text-[#39471D]">
          Terms &amp; Conditions
        </a>
        <a href={`${BASE}/refund-policy/`} className="text-[11px] font-semibold text-gray-500 hover:text-[#39471D]">
          Refund Policy
        </a>
        <a href={`${BASE}/privacy/`} className="text-[11px] font-semibold text-gray-500 hover:text-[#39471D]">
          Privacy Policy
        </a>
        <a href={`${BASE}/contact/`} className="text-[11px] font-semibold text-gray-500 hover:text-[#39471D]">
          Contact
        </a>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wider text-gray-400">
        <span>© 2026 Thallo Digital. All rights reserved.</span>
        <span>LinkedIn · X · hello@thallodigital.com</span>
      </div>
    </footer>
  );
}
