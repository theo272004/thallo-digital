import React from 'react';

export default function Footer({ setView }) {
  const handleLogoClick = (e) => {
    e.preventDefault();
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view, e) => {
    e.preventDefault();
    setView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="/" onClick={handleLogoClick} className="brand">
              <img src="/logo.png" alt="Thallo" className="brand-logo" />
            </a>
            <p>The AI visibility agency. We make B2B brands the default citation and recommendation in LLM search answers.</p>
          </div>
          <div className="foot-col">
            <h4>Services</h4>
            <a href="#services" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>AI Visibility Audit</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Authority Engine</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Flagship Projects</a>
            <a href="#tool" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Visibility Check</a>
          </div>
          <div className="foot-col">
            <h4>Industries</h4>
            <a href="#services" onClick={(e) => e.preventDefault()}>Fintech & Payments</a>
            <a href="#services" onClick={(e) => e.preventDefault()}>Health Tech & Care</a>
            <a href="#services" onClick={(e) => e.preventDefault()}>SaaS & Enterprise</a>
            <a href="#services" onClick={(e) => e.preventDefault()}>Professional Services</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="/" onClick={handleLogoClick}>About</a>
            <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)}>Thallo AI</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Contact</a>
            <a href="#cta" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Book an audit</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Thallo Digital. All rights reserved.</span>
          <span>LinkedIn · X · hello@thallo.co</span>
        </div>
      </div>
    </footer>
  );
}
