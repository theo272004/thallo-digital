'use client';

import React, { useState, useEffect } from 'react';
import { Magnetic, scrollToEl } from '@/components/motion';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Navbar({ currentView, setView }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 border-b border-gray-100 shadow-[0_8px_30px_-18px_rgba(57,71,29,0.35)]'
          : 'bg-white/70 border-b border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center">
        <a href="/" onClick={(e) => handleNavClick('home', e)} className="flex items-center gap-2 group">
          <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-6 object-contain" />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Services</a>
          <a href="#shift" onClick={(e) => handleHomeAnchorClick('shift', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">The Shift</a>
          <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Our Approach</a>
          <a href="#industries" onClick={(e) => handleHomeAnchorClick('industries', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Industries</a>
          <a href="#results" onClick={(e) => handleHomeAnchorClick('results', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Results</a>
          <a href="#blog" onClick={(e) => handleHomeAnchorClick('blog', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Resources</a>
          <a
            href="/thallo-ai"
            onClick={(e) => handleNavClick('ai-tool', e)}
            className={`text-xs font-bold transition-colors ${currentView === 'ai-tool' ? 'text-[#39471D] underline underline-offset-4' : 'text-gray-500 hover:text-[#39471D]'}`}
          >
            Thallo AI
          </a>
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#tool" onClick={(e) => handleHomeAnchorClick('tool', e)} className="px-4 py-2 border border-gray-200 rounded-[12px] text-xs font-bold text-gray-800 hover:border-gray-400 transition-all">
            Check my visibility ↗
          </a>
          <Magnetic>
            <a href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" className="px-4 py-2 bg-[#39471D] border border-[#39471D] rounded-[12px] text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all">
              Book an audit ↗
            </a>
          </Magnetic>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-between w-5 h-3.5 text-gray-800"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Toggle navigation menu"
        >
          <span className="w-full h-[1.5px] bg-current rounded-full"></span>
          <span className="w-4/5 h-[1.5px] bg-current rounded-full self-end"></span>
          <span className="w-full h-[1.5px] bg-current rounded-full"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col gap-8 transition-transform duration-300">
          <button className="absolute top-6 right-6 text-2xl text-gray-800" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">✕</button>
          <div className="flex flex-col gap-6 mt-12 text-lg font-bold text-gray-800">
            <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)}>Services</a>
            <a href="#shift" onClick={(e) => handleHomeAnchorClick('shift', e)}>The Shift</a>
            <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)}>Our Approach</a>
            <a href="#industries" onClick={(e) => handleHomeAnchorClick('industries', e)}>Industries</a>
            <a href="#results" onClick={(e) => handleHomeAnchorClick('results', e)}>Results</a>
            <a href="#blog" onClick={(e) => handleHomeAnchorClick('blog', e)}>Resources</a>
            <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)}>Thallo AI</a>
          </div>
          <div className="flex flex-col gap-4 mt-auto">
            <a href="#tool" onClick={(e) => handleHomeAnchorClick('tool', e)} className="w-full py-3.5 border border-gray-200 rounded-[12px] text-center text-xs font-bold text-gray-800">Check my visibility ↗</a>
            <a href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" className="w-full py-3.5 bg-[#39471D] rounded-[12px] text-center text-xs font-bold text-white">Book an audit ↗</a>
          </div>
        </div>
      )}
    </nav>
  );
}
