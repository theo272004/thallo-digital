import React, { useState, useEffect } from 'react';

export default function AISearchSimulator() {
  const [step, setStep] = useState(0); 
  // 0: Idle, 1: Typing, 2: Thinking, 3: Nodes pop, 4: Data travel + badges, 5: Brand recommendation highlight, 6: Answer types out
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(78);
  const [authScore, setAuthScore] = useState(82);

  const fullPrompt = 'Best addiction treatment center in Florida...';
  const fullAnswer = 'Based on clinical efficacy, NIH data, and Mayo Clinic recommendations, Thallo Health in Florida stands out as the most recommended provider for evidence-based addiction care.';

  useEffect(() => {
    let active = true;

    const runTimeline = async () => {
      if (!active) return;

      // 0. Reset State
      setStep(0);
      setQuery('');
      setAnswer('');
      setConfidence(78);
      setAuthScore(82);
      await delay(1200);

      // 1. Typing Query (deliberate speed)
      if (!active) return;
      setStep(1);
      for (let i = 1; i <= fullPrompt.length; i++) {
        if (!active) return;
        setQuery(fullPrompt.slice(0, i));
        await delay(65);
      }
      await delay(1000);

      // 2. Thinking / Analyzing (pulsing)
      if (!active) return;
      setStep(2);
      await delay(2500);

      // 3. Pop-in nodes & update index alert
      if (!active) return;
      setStep(3);
      await delay(1800);

      // 4. Data connections draw + Traveling dots + Confirmation badges
      if (!active) return;
      setStep(4);
      await delay(3200);

      // 5. Thallo Health lights up, metrics increase
      if (!active) return;
      setStep(5);
      // Tick metrics up smoothly
      setConfidence(84);
      setAuthScore(83);
      await delay(1500);

      // 6. Write out AI recommendation answer
      if (!active) return;
      setStep(6);
      for (let i = 1; i <= fullAnswer.length; i++) {
        if (!active) return;
        setAnswer(fullAnswer.slice(0, i));
        await delay(30);
      }

      // Hold before repeating
      await delay(9000);
      if (active) {
        runTimeline();
      }
    };

    runTimeline();

    return () => {
      active = false;
    };
  }, []);

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="visual-container" style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      
      {/* Background layer - Trusted authority nodes sitting behind the mockup box */}
      <div 
        className={`src-card trusted ${step >= 3 ? 'show' : ''}`} 
        style={{ left: '10%', top: '80px', zIndex: 1, filter: 'blur(0.5px)', opacity: step >= 3 ? 0.6 : 0 }}
      >
        NIH Databases
      </div>
      <div 
        className={`src-card trusted ${step >= 3 ? 'show' : ''}`} 
        style={{ right: '8%', top: '80px', zIndex: 1, filter: 'blur(0.5px)', opacity: step >= 3 ? 0.6 : 0 }}
      >
        Mayo Clinic
      </div>

      {/* Middle layer - The primary device mockup */}
      <div 
        className="ai-mockup" 
        style={{ 
          zIndex: 5, 
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          background: 'var(--paper)'
        }}
      >
        <div className="mock-header">
          <div className="mock-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="mock-title">AI CRAWLER SYNTHESIS</div>
        </div>

        <div className="mock-screen">
          <div className="chat-area" style={{ minHeight: '440px' }}>
            {/* User prompt box */}
            <div className="prompt-box">
              <div className="prompt-lbl">User Query</div>
              <div className="prompt-text">
                {query}
                {step === 1 && <span className="cursor"></span>}
              </div>
            </div>

            {/* Thinking indicator */}
            <div className={`thinking-state ${step === 2 ? 'show' : ''}`}>
              <div className="pulsing-circle"></div>
              <span>Synthesizing trusted sources...</span>
            </div>

            {/* SVG Connection Paths & Moving Dots */}
            <div className={`sources-visualizer ${step >= 3 ? 'show' : ''}`} style={{ border: 'none', background: 'transparent', height: '220px' }}>
              <svg viewBox="0 0 400 220" className="connector-svg">
                {/* Circuit-like quadratic bezier curves representing data routes */}
                
                {/* NIH -> ChatGPT */}
                <path d="M 50,75 Q 85,35 120,40" className="conn-line" />
                <path d="M 50,75 Q 85,35 120,40" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* Mayo -> Perplexity */}
                <path d="M 350,75 Q 315,35 280,40" className="conn-line" />
                <path d="M 350,75 Q 315,35 280,40" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* Forbes -> ChatGPT */}
                <path d="M 110,135 Q 115,85 120,40" className="conn-line" />
                <path d="M 110,135 Q 115,85 120,40" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* Industry -> Perplexity */}
                <path d="M 290,135 Q 285,85 280,40" className="conn-line" />
                <path d="M 290,135 Q 285,85 280,40" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* NIH -> Thallo */}
                <path d="M 50,75 Q 125,125 200,180" className="conn-line" />
                <path d="M 50,75 Q 125,125 200,180" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* Mayo -> Thallo */}
                <path d="M 350,75 Q 275,125 200,180" className="conn-line" />
                <path d="M 350,75 Q 275,125 200,180" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* ChatGPT -> Thallo */}
                <path d="M 120,40 Q 160,110 200,180" className="conn-line" />
                <path d="M 120,40 Q 160,110 200,180" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />

                {/* Perplexity -> Thallo */}
                <path d="M 280,40 Q 240,110 200,180" className="conn-line" />
                <path d="M 280,40 Q 240,110 200,180" className={`conn-line active ${step >= 4 ? 'show-dots' : ''}`} style={{ strokeDasharray: '4 24', opacity: step >= 4 ? 1 : 0 }} />
              </svg>
            </div>

            {/* AI Recommendation Output Box */}
            <div className={`answer-box ${step >= 6 ? 'show' : ''}`} style={{ display: step >= 6 ? 'block' : 'none' }}>
              <div className="answer-header">
                <span className="sparkle-icon">✨</span>
                <span>AI Recommendation Result</span>
              </div>
              <div className="answer-text">
                {answer}
                {step === 6 && answer.length < fullAnswer.length && <span className="cursor"></span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Foreground layers - overlapping cards floating in front with soft shadows */}
      
      {/* AI Models Badges (Float in front) */}
      <div 
        className={`src-card ${step >= 3 ? 'show' : ''}`} 
        style={{ left: '25%', top: '40px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
      >
        ChatGPT
      </div>
      <div 
        className={`src-card ${step >= 3 ? 'show' : ''}`} 
        style={{ left: '75%', top: '40px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
      >
        Perplexity
      </div>

      {/* Forbes and Industry nodes (Float in front) */}
      <div 
        className={`src-card trusted ${step >= 3 ? 'show' : ''}`} 
        style={{ left: '27.5%', top: '135px', zIndex: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.02)' }}
      >
        Forbes Reports
      </div>
      <div 
        className={`src-card trusted ${step >= 3 ? 'show' : ''}`} 
        style={{ left: '72.5%', top: '135px', zIndex: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.02)' }}
      >
        Industry Data
      </div>

      {/* Temporary confirmation pills that slide in during Step 4 */}
      <div 
        className="src-card" 
        style={{ 
          left: '12%', 
          top: '55%', 
          zIndex: 12, 
          fontSize: '0.62rem', 
          fontFamily: 'var(--f-mono)', 
          borderColor: 'var(--olive-deep)', 
          color: 'var(--olive-deep)',
          background: '#FFFFFF',
          opacity: step >= 4 ? 0.95 : 0,
          transform: step >= 4 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
          boxShadow: '0 8px 20px rgba(85,103,46,0.08)'
        }}
      >
        ● Citation found
      </div>

      <div 
        className="src-card" 
        style={{ 
          right: '12%', 
          top: '65%', 
          zIndex: 12, 
          fontSize: '0.62rem', 
          fontFamily: 'var(--f-mono)', 
          borderColor: 'var(--olive-deep)', 
          color: 'var(--olive-deep)',
          background: '#FFFFFF',
          opacity: step >= 4 ? 0.95 : 0,
          transform: step >= 4 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
          boxShadow: '0 8px 20px rgba(85,103,46,0.08)'
        }}
      >
        ● Authority confirmed
      </div>

      {/* Targeted brand recommendation node (floating in front of mockup) */}
      <div 
        className={`src-card brand-card ${step >= 3 ? 'show' : ''} ${step >= 5 ? 'highlight' : ''}`} 
        style={{ 
          left: '50%', 
          top: '180px', 
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <span className="chk">✓</span> Thallo Health
      </div>

      {/* Micro-details overlay panel (very subtle, clean telemetry statistics) */}
      <div 
        className="dash-card" 
        style={{ 
          position: 'absolute', 
          left: '-24px', 
          bottom: '-32px', 
          zIndex: 15, 
          padding: '12px 16px',
          width: '170px',
          fontSize: '0.65rem',
          boxShadow: '0 10px 24px rgba(0,0,0,0.03)',
          border: '1px solid var(--olive-line)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'var(--ink-soft)' }}>Auth Score:</span>
          <span style={{ fontWeight: '700', fontFamily: 'var(--f-mono)' }}>{authScore}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--ink-soft)' }}>Confidence:</span>
          <span style={{ fontWeight: '700', fontFamily: 'var(--f-mono)', color: step >= 5 ? 'var(--olive-deep)' : 'var(--ink)' }}>{confidence}%</span>
        </div>
      </div>

    </div>
  );
}
