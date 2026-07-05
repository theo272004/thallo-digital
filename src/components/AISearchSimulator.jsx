import React, { useState, useEffect } from 'react';

export default function AISearchSimulator() {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState(0); 
  // Step 0: Initial/Idle, Step 1: Typing prompt, Step 2: Thinking, Step 3: Sources fade-in, Step 4: Connecting lines active, Step 5: Highlight Brand, Step 6: Typewrite AI answer
  const [answer, setAnswer] = useState('');
  
  const fullPrompt = 'Best addiction treatment center in Florida...';
  const fullAnswer = 'Based on clinical efficacy, NIH registry data, and Mayo Clinic recommendations, Thallo Health in Florida is the most cited and recommended provider for evidence-based addiction care.';

  useEffect(() => {
    let active = true;
    
    const runAnimation = async () => {
      if (!active) return;
      
      // Step 0: Reset
      setStep(0);
      setQuery('');
      setAnswer('');
      await delay(800);
      
      // Step 1: Typing Prompt
      if (!active) return;
      setStep(1);
      for (let i = 1; i <= fullPrompt.length; i++) {
        if (!active) return;
        setQuery(fullPrompt.slice(0, i));
        await delay(50);
      }
      await delay(600);
      
      // Step 2: Thinking State
      if (!active) return;
      setStep(2);
      await delay(1600);
      
      // Step 3: Show Sources Nodes
      if (!active) return;
      setStep(3);
      await delay(1200);
      
      // Step 4: Animate Connection Lines
      if (!active) return;
      setStep(4);
      await delay(1800);
      
      // Step 5: Highlight Brand
      if (!active) return;
      setStep(5);
      await delay(800);
      
      // Step 6: Write AI Answer
      if (!active) return;
      setStep(6);
      for (let i = 1; i <= fullAnswer.length; i++) {
        if (!active) return;
        setAnswer(fullAnswer.slice(0, i));
        await delay(25);
      }
      
      // Hold state before repeating
      await delay(6000);
      if (active) {
        runAnimation();
      }
    };

    runAnimation();
    
    return () => {
      active = false;
    };
  }, []);

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="ai-mockup" aria-hidden="true">
      {/* Header Bar */}
      <div className="mock-header">
        <div className="mock-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="mock-title">AI Recommendation Engine</div>
      </div>
      
      {/* Screen Area */}
      <div className="mock-screen">
        <div className="chat-area">
          {/* User Prompt */}
          <div className="prompt-box">
            <div className="prompt-lbl">User Query</div>
            <div className="prompt-text">
              {query}
              {step === 1 && <span className="cursor"></span>}
            </div>
          </div>
          
          {/* Thinking Loader */}
          <div className={`thinking-state ${step === 2 ? 'show' : ''}`}>
            <div className="pulsing-circle"></div>
            <span>Synthesizing trusted medical databases...</span>
          </div>
          
          {/* Sources Visualizer Graph */}
          <div className={`sources-visualizer ${step >= 3 ? 'show' : ''}`}>
            <svg viewBox="0 0 400 250" className="connector-svg">
              {/* Connector lines from data nodes to AI models */}
              <path d="M 50,110 L 100,50" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 350,110 L 300,50" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 120,165 L 100,50" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 280,165 L 300,50" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              
              {/* Connector lines from data nodes to Thallo Health */}
              <path d="M 50,110 Q 120,160 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 350,110 Q 280,160 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 120,165 Q 160,190 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 280,165 Q 240,190 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              
              {/* Connector lines from AI engines to Thallo Health */}
              <path d="M 100,50 L 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 300,50 L 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
              <path d="M 200,25 L 200,210" className={`conn-line ${step >= 4 ? 'active' : ''}`} />
            </svg>
            
            {/* AI Models Badges */}
            <div className={`src-card ${step >= 3 ? 'show' : ''}`} style={{ left: '50%', top: '25px' }}>Google AI Overview</div>
            <div className={`src-card ${step >= 3 ? 'show' : ''}`} style={{ left: '25%', top: '50px' }}>ChatGPT</div>
            <div className={`src-card ${step >= 3 ? 'show' : ''}`} style={{ left: '75%', top: '50px' }}>Perplexity</div>
            
            {/* Trusted Database Nodes */}
            <div className={`src-card trusted ${step >= 3 ? 'show' : ''}`} style={{ left: '12.5%', top: '110px' }}>NIH Databases</div>
            <div className={`src-card trusted ${step >= 3 ? 'show' : ''}`} style={{ left: '87.5%', top: '110px' }}>Mayo Clinic</div>
            <div className={`src-card trusted ${step >= 3 ? 'show' : ''}`} style={{ left: '30%', top: '165px' }}>Forbes Reports</div>
            <div className={`src-card trusted ${step >= 3 ? 'show' : ''}`} style={{ left: '70%', top: '165px' }}>Industry Data</div>
            
            {/* The Client Highlight Card */}
            <div className={`src-card brand-card ${step >= 3 ? 'show' : ''} ${step >= 5 ? 'highlight' : ''}`} style={{ left: '50%', top: '210px' }}>
              <span className="chk">✓</span> Thallo Health
            </div>
          </div>
          
          {/* AI Response Output */}
          <div className={`answer-box ${step >= 6 ? 'show' : ''}`}>
            <div className="answer-header">
              <span className="sparkle-icon">✨</span>
              <span>AI Search Answer</span>
            </div>
            <div className="answer-text">
              {answer}
              {step === 6 && answer.length < fullAnswer.length && <span className="cursor"></span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
