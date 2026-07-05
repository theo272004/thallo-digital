import React from 'react';

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: string, e: React.MouseEvent) => {
    e.preventDefault();
    setView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleHomeAnchorClick = (anchorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setView('home');
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <footer className="bg-white border-t border-gray-100 py-16" id="contact">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1">
          <a href="/" onClick={handleLogoClick} className="inline-block mb-4">
            <img src="/thallo-digital/logo.png" alt="Thallo Digital" className="h-5 object-contain" />
          </a>
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-[28ch]">
            The AI visibility agency. We make B2B brands the default citation and recommendation in LLM search answers.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-4">Solutions</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)} className="hover:text-[#39471D]">AI Visibility Audit</a>
            <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)} className="hover:text-[#39471D]">Authority Engine</a>
            <a href="#services" onClick={(e) => handleHomeAnchorClick('services', e)} className="hover:text-[#39471D]">Flagship Projects</a>
            <a href="#tool" onClick={(e) => handleHomeAnchorClick('tool', e)} className="hover:text-[#39471D]">Visibility Check</a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-4">Industries</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="#services" onClick={(e) => e.preventDefault()} className="hover:text-[#39471D]">Fintech & Payments</a>
            <a href="#services" onClick={(e) => e.preventDefault()} className="hover:text-[#39471D]">Health Tech & Care</a>
            <a href="#services" onClick={(e) => e.preventDefault()} className="hover:text-[#39471D]">SaaS & Enterprise</a>
            <a href="#services" onClick={(e) => e.preventDefault()} className="hover:text-[#39471D]">Professional Services</a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase mb-4">Company</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
            <a href="/" onClick={handleLogoClick} className="hover:text-[#39471D]">About</a>
            <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)} className="hover:text-[#39471D]">Thallo AI</a>
            <a href="#contact" onClick={(e) => handleHomeAnchorClick('contact', e)} className="hover:text-[#39471D]">Contact</a>
            <a href="#cta" onClick={(e) => handleHomeAnchorClick('cta', e)} className="hover:text-[#39471D]">Book an audit</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gray-50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-wider text-gray-400">
        <span>© 2026 THALLO DIGITAL. ALL RIGHTS RESERVED.</span>
        <span>LINKEDIN · X · HELLO@THALLO.CO</span>
      </div>
    </footer>
  );
}
