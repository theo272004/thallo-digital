import React from 'react';
import AISearchSimulator from './AISearchSimulator';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">AI Visibility Agency</span>
          <h1>
            Be the name <span className="g serif-i">AI recommends.</span>
          </h1>
          <p className="lede">
            Your buyers ask ChatGPT, Perplexity, and Google before they ever ask you. Thallo makes sure the answer they get is your brand, built on authority that compounds.
          </p>
          <div className="hero-ctas">
            <a href="#cta" className="btn" onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Book an AI visibility audit <span className="ar">→</span>
            </a>
            <a href="#services" className="btn ghost" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See how it works
            </a>
          </div>
          <p className="hero-note">
            Trusted by teams in fintech · health tech · professional B2B services
          </p>
        </div>

        <div className="hero-visual">
          <AISearchSimulator />
        </div>
      </div>
    </section>
  );
}
