import React from 'react';
import { BASE, BLOG_URL, RESEARCH_URL } from '@/lib/site';

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Research And Content', href: `${BASE}/#services` },
      { label: 'Website Design And Development', href: `${BASE}/#services` },
      { label: 'Search And AI Visibility', href: `${BASE}/#services` },
      { label: 'Digital PR And Distribution', href: `${BASE}/#services` },
      { label: 'The Authority Engine', href: `${BASE}/services/` },
      { label: 'Focused Projects', href: `${BASE}/#focused-projects` },
    ],
  },
  {
    title: 'Industries',
    links: ['Professional Services', 'Fintech', 'Health Tech', 'Legal Tech', 'Specialized Software'].map((label) => ({
      label,
      href: `${BASE}/industries/`,
    })),
  },
  {
    title: 'Explore',
    links: [
      { label: 'About Thallo', href: `${BASE}/about/` },
      { label: 'Our Work', href: `${BASE}/results/` },
      { label: 'Our Research', href: RESEARCH_URL },
      { label: 'Blog', href: BLOG_URL },
      { label: 'Contact', href: `${BASE}/contact/` },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/thallo-digital/', external: true },
    ],
  },
];

// `relative z-10` is load-bearing: /contact/ pins a photograph at z-index 0, and
// a static footer — however late in the document — paints underneath any
// positioned element. Without it the picture covers the whole footer.
export default function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-gray-100 py-16">
      {/* Cami's footer of 2 November: the line under the wordmark and three
          columns, word for word. The four capabilities go to "What we do" on
          the home, the two ways of working to their offers, every sector to
          /industries/ until each has a page of its own. */}
      <div className="max-w-[90rem] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
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
          <p className="text-xs text-gray-400 font-semibold leading-relaxed max-w-[28ch]">
            Authority That Makes You The Clear&nbsp;Choice.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4">{col.title}</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-500 font-semibold">
              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}
                  className="hover:text-[#39471D]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legal strip. Its own row above the copyright rather than a fifth column:
          a payment processor reviewing the site looks for these three in the
          footer, and a reader looking for the refund window should not have to
          find it among the service links. */}
      <div className="max-w-[90rem] mx-auto px-6 border-t border-gray-100 pt-8 flex flex-wrap gap-x-7 gap-y-3">
        <a href={`${BASE}/terms/`} className="text-xs font-semibold text-gray-500 hover:text-[#39471D]">
          Terms &amp; Conditions
        </a>
        <a href={`${BASE}/refund-policy/`} className="text-xs font-semibold text-gray-500 hover:text-[#39471D]">
          Refund Policy
        </a>
        <a href={`${BASE}/privacy/`} className="text-xs font-semibold text-gray-500 hover:text-[#39471D]">
          Privacy Policy
        </a>
        <a href={`${BASE}/contact/`} className="text-xs font-semibold text-gray-500 hover:text-[#39471D]">
          Contact
        </a>
      </div>

      {/* Three items on one line, and the credit is the third rather than a
          line of its own: a studio's name under a client's copyright notice
          reads as a second signature on the page. Here it sits at the end of
          the row the small print already occupies, in the same grey, and only
          the name itself is a link — "Developed by" is not part of the target,
          so the click area is the studio and nothing else. */}
      <div className="max-w-[90rem] mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wider text-gray-400">
        <span>© 2026 Thallo Digital. All rights reserved.</span>
        <span className="order-3">
          Developed by{' '}
          <a
            href="https://kaivastudio.com"
            target="_blank"
            rel="noopener"
            className="font-bold text-gray-500 underline underline-offset-2 transition-colors hover:text-[#39471D]"
          >
            Kaiva Studio
          </a>
        </span>
        <span className="order-2">
          <a
            href="https://www.linkedin.com/company/thallo-digital/posts/?feedView=all"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-[#39471D]"
          >
            LinkedIn
          </a>
          {' · '}
          <a
            href="mailto:contact@thallodigital.com"
            className="transition-colors hover:text-[#39471D]"
          >
            contact@thallodigital.com
          </a>
        </span>
      </div>
    </footer>
  );
}
