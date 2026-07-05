import React, { useState } from 'react';

export default function Navbar({ currentView, setView }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view, e) => {
    e.preventDefault();
    setView(view);
    setIsOpen(false);
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <>
      <header className="nav scrolled" id="nav">
        <div className="wrap nav-in">
          <a href="/" onClick={(e) => handleNavClick('home', e)} className="brand">
            <img src="/logo.png" alt="Thallo" className="brand-logo" />
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#services" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Services</a></li>
              <li><a href="#shift" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('shift')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>The Shift</a></li>
              <li><a href="#approach" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('approach')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Our Approach</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Contact</a></li>
              <li>
                <a 
                  href="/thallo-ai" 
                  onClick={(e) => handleNavClick('ai-tool', e)}
                  style={{ color: currentView === 'ai-tool' ? 'var(--olive-deep)' : '', fontWeight: currentView === 'ai-tool' ? '700' : '' }}
                >
                  Thallo AI
                </a>
              </li>
            </ul>
          </nav>
          <div className="nav-cta">
            <a 
              href="#tool" 
              onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' }), 50); }} 
              className="btn ghost"
            >
              Check my visibility
            </a>
            <a 
              href="#cta" 
              onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }), 50); }} 
              className="btn"
            >
              Book an audit <span className="ar">→</span>
            </a>
            <button className="burger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
        <button className="mm-close" onClick={() => setIsOpen(false)} aria-label="Close menu">✕</button>
        <a href="#services" onClick={(e) => { e.preventDefault(); setView('home'); setIsOpen(false); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Services</a>
        <a href="#shift" onClick={(e) => { e.preventDefault(); setView('home'); setIsOpen(false); setTimeout(() => document.getElementById('shift')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>The Shift</a>
        <a href="#approach" onClick={(e) => { e.preventDefault(); setView('home'); setIsOpen(false); setTimeout(() => document.getElementById('approach')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Our Approach</a>
        <a href="/thallo-ai" onClick={(e) => handleNavClick('ai-tool', e)}>Thallo AI</a>
        <a 
          href="#cta" 
          className="btn" 
          onClick={(e) => { e.preventDefault(); setView('home'); setIsOpen(false); setTimeout(() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
        >
          Book an audit →
        </a>
      </div>
    </>
  );
}
