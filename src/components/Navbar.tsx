'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Magnetic, scrollToEl } from '@/components/motion';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Navbar({ currentView, setView }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Hide the bar while scrolling down; bring it back the moment you scroll up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const delta = y - lastY.current;
      if (y < 80) setHidden(false); // never hide near the top
      else if (delta > 6) setHidden(true); // scrolling down
      else if (delta < -6) setHidden(false); // scrolling up
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (view: string, e: React.MouseEvent) => {
    e.preventDefault();
    setView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleHomeAnchorClick = (anchorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setView('home');
    setMobileMenuOpen(false);
    // Allow the view swap to paint before scrolling.
    setTimeout(() => scrollToEl(`#${anchorId}`), 60);
  };

  return (
    <nav
      className={`fixed top-3 sm:top-5 inset-x-3 sm:inset-x-6 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hidden && !mobileMenuOpen ? '-translate-y-[150%]' : 'translate-y-0'
      }`}
    >
      <div
        className={`max-w-[1440px] mx-auto rounded-full flex justify-between items-center px-4 sm:px-6 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_45px_-20px_rgba(57,71,29,0.35)]'
            : 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_36px_-18px_rgba(57,71,29,0.22)]'
        }`}
      >
        <a href="/" onClick={(e) => handleNavClick('home', e)} className="flex items-center gap-2 group shrink-0">
          <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-9 sm:h-11 object-contain" />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#services" onClick={(e) => handleNavClick('services', e)} className="text-sm font-semibold text-gray-500 hover:text-[#39471D] transition-colors">Services</a>
          <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)} className="text-sm font-semibold text-gray-500 hover:text-[#39471D] transition-colors">Our Approach</a>
          <a href="#results" onClick={(e) => handleHomeAnchorClick('results', e)} className="text-sm font-semibold text-gray-500 hover:text-[#39471D] transition-colors">Results</a>
          <a href="#blog" onClick={(e) => handleHomeAnchorClick('blog', e)} className="text-sm font-semibold text-gray-500 hover:text-[#39471D] transition-colors">Resources</a>
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="/thallo-ai"
            onClick={(e) => handleNavClick('ai-tool', e)}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Check my visibility ↗
          </a>
          <Magnetic>
            <a href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" className="px-4 py-2 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all">
              Book an audit ↗
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col gap-8 transition-transform duration-300">
          <button
            className="absolute top-6 right-6 w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-xl text-gray-800"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          <div className="flex flex-col gap-6 mt-12 text-lg font-bold text-gray-800">
            <a href="#services" onClick={(e) => handleNavClick('services', e)}>Services</a>
            <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)}>Our Approach</a>
            <a href="#results" onClick={(e) => handleHomeAnchorClick('results', e)}>Results</a>
            <a href="#blog" onClick={(e) => handleHomeAnchorClick('blog', e)}>Resources</a>
          </div>
          <div className="flex flex-col gap-4 mt-auto">
            <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)} className="w-full py-3.5 border border-gray-200 rounded-full text-center text-sm font-bold text-gray-800">Check my visibility ↗</a>
            <a href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" className="w-full py-3.5 bg-[#39471D] rounded-full text-center text-sm font-bold text-white">Book an audit ↗</a>
          </div>
        </div>
      )}
    </nav>
  );
}
