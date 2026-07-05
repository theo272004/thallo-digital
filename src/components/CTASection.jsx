import React from 'react';

export default function CTASection() {
  return (
    <section className="cta-final" id="cta">
      <div className="wrap">
        <span className="eyebrow" style={{ justifyContent: 'center' }}>Get Audited</span>
        <h2>Be the answer buyers <em>find first.</em></h2>
        <p>
          Start with a comprehensive AI visibility audit. We map your category, analyze your competitors, and lay out the exact roadmap to citation.
        </p>
        <a 
          href="mailto:hello@thallo.co?subject=AI Visibility Audit Request" 
          className="btn" 
          style={{ fontSize: '1rem', padding: '0.9rem 1.8rem', marginTop: '8px' }}
        >
          Book your strategy audit <span className="ar">→</span>
        </a>
      </div>
    </section>
  );
}
