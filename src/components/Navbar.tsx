'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { Magnetic } from '@/components/motion';

/**
 * `page` is the route this link owns, when it owns one. The two anchors point
 * at sections of the home page rather than pages, so they never light up —
 * marking them would claim you are somewhere you are not.
 */
const LINKS = [
  { label: 'Our Plans', href: '/thallo-digital/services/', page: '/services' },
  { label: 'Industries', href: '/thallo-digital/industries/', page: '/industries' },
  { label: 'Case Studies', href: '/thallo-digital/results/', page: '/results' },
  { label: 'Blog', href: '/thallo-digital/#blog' },
];

export default function Navbar() {
  // Next strips basePath here, so /thallo-digital/services/ arrives as /services
  const pathname = usePathname();
  const isCurrent = (page?: string) =>
    !!page && (pathname === page || pathname === page + '/');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const delta = y - lastY.current;
      if (y < 80) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -6) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The drawer covers the page, so the page must not scroll under it.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen]);

  return (
    <>
    <nav
      className={`fixed top-3 sm:top-5 inset-x-3 sm:inset-x-6 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hidden && !mobileMenuOpen ? '-translate-y-[150%]' : 'translate-y-0'
      }`}
    >
      <div
        className={`max-w-[1440px] mx-auto rounded-full flex justify-between items-center px-4 sm:px-6 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_20px_45px_-20px_rgba(57,71,29,0.35)]'
            : 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_36px_-18px_rgba(57,71,29,0.22)]'
        }`}
      >
        <a href="/thallo-digital/" className="flex items-center gap-2 group shrink-0">
          <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-9 sm:h-11 object-contain" />
        </a>

        {/* Desktop Menu — the page you are on wears the hover colour for good */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => {
            const here = isCurrent(l.page);
            return (
              <a
                key={l.label}
                href={l.href}
                aria-current={here ? 'page' : undefined}
                className={`text-sm font-semibold transition-colors hover:text-[#39471D] ${
                  here ? 'text-[#39471D]' : 'text-gray-500'
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="/thallo-digital/thallo-ai/"
            className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Check my visibility <ArrowUpRight className="ml-0.5" />
          </a>
          <Magnetic>
            <a href="/thallo-digital/contact/" className="px-4 py-2 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all">
              Book an audit <ArrowUpRight className="ml-0.5" />
            </a>
          </Magnetic>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-800 shrink-0"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Toggle navigation menu"
        >
          <span className="flex flex-col justify-between w-4 h-3">
            <span className="w-full h-[1.5px] bg-current rounded-full"></span>
            <span className="w-3/4 h-[1.5px] bg-current rounded-full self-end"></span>
            <span className="w-full h-[1.5px] bg-current rounded-full"></span>
          </span>
        </button>
      </div>

    </nav>

    {/* Mobile Drawer — a sibling of <nav>, not a child, and that is the whole
        fix. The nav carries a transform for its hide-on-scroll, and a
        transformed element becomes the containing block for fixed descendants,
        so `fixed inset-0` was sizing itself to the nav pill instead of the
        screen: a white strip at the top with the links spilling out of it and
        the page showing through. Out here it measures against the viewport. */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-[60] bg-white p-8 flex flex-col gap-8 overscroll-contain">
        <div className="flex items-start justify-between">
          <a href="/thallo-digital/" onClick={() => setMobileMenuOpen(false)}>
            <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-9 object-contain" />
          </a>
          <button
            className="w-11 h-11 -mt-1 rounded-full border border-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Closing on every link, not just /contact/: the two anchors point at
            sections of a page you may already be on, so without this the drawer
            stayed up over the place it had just scrolled to. */}
        <div className="flex flex-col gap-6 mt-4 text-lg font-bold">
          {LINKS.map((l) => {
            const here = isCurrent(l.page);
            return (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={here ? 'page' : undefined}
                className={here ? 'text-[#39471D]' : 'text-gray-800'}
              >
                {l.label}
              </a>
            );
          })}
        </div>
        <div className="flex flex-col gap-4 mt-auto">
          <a href="/thallo-digital/thallo-ai/" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 border border-gray-200 rounded-full text-center text-sm font-bold text-gray-800">Check my visibility <ArrowUpRight className="ml-0.5" /></a>
          <a href="/thallo-digital/contact/" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-[#39471D] rounded-full text-center text-sm font-bold text-white">Book an audit <ArrowUpRight className="ml-0.5" /></a>
        </div>
      </div>
    )}
    </>
  );
}
