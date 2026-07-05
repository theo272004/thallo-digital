import React, { useState } from 'react';

export default function VisibilityCheck() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Fintech');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!brand.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Simulate audit calculations
    setTimeout(() => {
      // Deterministic visibility score based on string length
      const score = Math.round(((brand.length * 7) % 35) + 12);
      
      setResult({
        score: score,
        mentions: score > 30 ? '2/3 engines' : '0/3 engines',
        perplexity: score > 30 ? 'Mentioned' : 'Not mentioned',
        chatGpt: score > 40 ? 'Cited' : 'Not recommended',
        googleAi: 'Not recommended',
        advice: score > 30 
          ? `Your brand "${brand}" has baseline citations in ${category}, but lacks connection to authority databases (NIH/Mayo Clinic). It is frequently ignored for direct purchaser recommendations.`
          : `Your brand "${brand}" is completely invisible to conversational AI models for enterprise searches in ${category}. The AI recommendations default entirely to your competitors.`
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <section className="tool" id="tool">
      <div className="wrap">
        <div className="tool-wrap">
          {/* Left Panel: Form */}
          <div>
            <span className="tag">Interactive Diagnosis</span>
            <h2>Check your AI Visibility.</h2>
            <p className="sub">
              Enter your B2B brand and category to estimate your current recommendation rate across ChatGPT, Claude, and Google AI Overview.
            </p>
            <form onSubmit={handleCheck}>
              <div className="field">
                <label htmlFor="compName">Company Brand Name</label>
                <input 
                  type="text" 
                  id="compName" 
                  placeholder="e.g. Meridian" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="compCat">Category / Industry</label>
                <select 
                  id="compCat" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Fintech">Fintech & Payments</option>
                  <option value="Health Tech">Health Tech & Recovery</option>
                  <option value="SaaS">Enterprise Software / SaaS</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} disabled={isLoading}>
                {isLoading ? 'Scanning search databases...' : 'Run Visibility Check →'}
              </button>
            </form>
          </div>

          {/* Right Panel: Result Display */}
          <div className="result">
            {isLoading ? (
              <div className="empty">
                <div className="pulsing-circle" style={{ margin: '0 auto 16px', width: '20px', height: '20px' }}></div>
                <p>Crawling LLM model logs...</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Evaluating brand association and consensus references</p>
              </div>
            ) : result ? (
              <div>
                <div className="score-head">
                  <div className="big">{result.score}%</div>
                  <span className="of">VISIBILITY SCORE</span>
                </div>
                <p className="score-sub">Total recommendation rate across ChatGPT, Claude & Perplexity</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid var(--olive-line)', borderBottom: '1px solid var(--olive-line)', padding: '12px 0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>ChatGPT recommendation:</span>
                    <span style={{ fontWeight: '700', color: result.chatGpt === 'Cited' ? 'var(--olive-deep)' : '#EF4444' }}>{result.chatGpt}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>Perplexity recommendation:</span>
                    <span style={{ fontWeight: '700', color: result.perplexity === 'Mentioned' ? 'var(--olive-deep)' : '#EF4444' }}>{result.perplexity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>Google AI Overview:</span>
                    <span style={{ fontWeight: '700', color: '#EF4444' }}>{result.googleAi}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--ink)' }}>{result.advice}</p>
                
                <a 
                  href="#cta" 
                  onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{ display: 'block', marginTop: '16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--olive-deep)', textDecoration: 'underline' }}
                >
                  Book a full B2B visibility audit to fix this →
                </a>
              </div>
            ) : (
              <div className="empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p>Submit your brand details to generate a real-time visibility diagnostic.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
