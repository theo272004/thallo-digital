import React, { useState, useEffect } from 'react';
import AISearchSimulator from './AISearchSimulator';

const words = ['Google', 'ChatGPT', 'Perplexity', 'AI'];

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    if (wordIdx < words.length - 1) {
      const t = setTimeout(() => {
        setWordIdx(wordIdx + 1);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [wordIdx]);

  return (
    <section className="hero" id="top" style={{ padding: '120px 0' }}>
      <div className="wrap hero-grid">
        <div className="hero-copy" style={{ zIndex: 10 }}>
          <span className="eyebrow">AI Visibility Agency</span>
          <h1 className="hero-tagline" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>Be the answer</span>
            <span className="rotating-word" style={{ color: 'var(--olive-deep)', fontStyle: 'italic', transition: 'all 0.4s ease' }}>
              {words[wordIdx]}
            </span>
            <span>recommends.</span>
          </h1>
          <p className="lede" style={{ marginTop: '24px', marginBottom: '40px' }}>
            Your buyers ask ChatGPT, Perplexity, and Google before they ever buy. Thallo makes sure the answer they get is your brand.
          </p>
          <div className="hero-ctas">
            <a href="#cta" className="btn" onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Book an AI visibility audit <span className="ar">→</span>
            </a>
            <a href="#services" className="btn ghost" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See how it works
            </a>
          </div>
          <p className="hero-note" style={{ marginTop: '48px' }}>
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
