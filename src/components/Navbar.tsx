'use client';

import React, { useState } from 'react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Navbar({ currentView, setView }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    
    // Slight delay to allow view swap state to paint before scrolling
    setTimeout(() => {
      const el = document.getElementById(anchorId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 transition-all">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <a 
          href="/" 
          onClick={(e) => handleNavClick('home', e)} 
          className="flex items-center gap-2 group"
        >
          <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-6 object-contain" />
        </a>

        {/* Desktop Menu Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Services</a>
          <a href="#shift" onClick={(e) => handleHomeAnchorClick('shift', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">The Shift</a>
          <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)} className="text-xs font-bold text-gray-500 hover:text-[#39471D] transition-colors">Our Approach</a>
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

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a 
            href="#tool" 
            onClick={(e) => handleHomeAnchorClick('tool', e)} 
            className="px-4 py-2 border border-gray-200 rounded-[12px] text-xs font-bold text-gray-800 hover:border-gray-400 transition-all"
          >
            Check my visibility ↗
          </a>
          <a 
            href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
            className="px-4 py-2 bg-[#39471D] border border-[#39471D] rounded-[12px] text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all"
          >
            Book an audit ↗
          </a>
        </div>

        {/* Mobile Hamburger toggle */}
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

      {/* Mobile Drawer Menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col gap-8 transition-transform duration-300">
          <button 
            className="absolute top-6 right-6 text-2xl text-gray-800"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          
          <div className="flex flex-col gap-6 mt-12 text-lg font-bold text-gray-800">
            <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)}>Services</a>
            <a href="#shift" onClick={(e) => handleHomeAnchorClick('shift', e)}>The Shift</a>
            <a href="#approach" onClick={(e) => handleHomeAnchorClick('approach', e)}>Our Approach</a>
            <a href="#results" onClick={(e) => handleHomeAnchorClick('results', e)}>Results</a>
            <a href="#blog" onClick={(e) => handleHomeAnchorClick('blog', e)}>Resources</a>
            <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)}>Thallo AI</a>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <a 
              href="#tool" 
              onClick={(e) => handleHomeAnchorClick('tool', e)}
              className="w-full py-3.5 border border-gray-200 rounded-[12px] text-center text-xs font-bold text-gray-800"
            >
              Check my visibility ↗
            </a>
            <a 
              href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
              className="w-full py-3.5 bg-[#39471D] rounded-[12px] text-center text-xs font-bold text-white"
            >
              Book an audit ↗
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
