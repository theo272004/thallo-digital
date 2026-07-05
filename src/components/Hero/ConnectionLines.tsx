import React from 'react';

interface ConnectionLinesProps {
  step: number;
}

export default function ConnectionLines({ step }: ConnectionLinesProps) {
  return (
    <div className="connector-svg-container">
      <svg viewBox="0 0 700 500" className="w-full h-full">
        {/* Google -> Phone Top Bezel (Appears at Step 3) */}
        <path 
          d="M 110 95 C 110 180, 260 240, 350 270" 
          className="curved-line" 
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
        <path 
          d="M 110 95 C 110 180, 260 240, 350 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* ChatGPT -> Phone Top Bezel (Appears at Step 4) */}
        <path 
          d="M 590 85 C 590 180, 440 240, 350 270" 
          className="curved-line" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
        <path 
          d="M 590 85 C 590 180, 440 240, 350 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* Perplexity -> Phone Top Bezel (Appears at Step 5) */}
        <path 
          d="M 120 265 C 180 265, 280 270, 350 270" 
          className="curved-line" 
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
        <path 
          d="M 120 265 C 180 265, 280 270, 350 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 6 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* Forbes -> Phone Top Bezel (Appears at Step 6) */}
        <path 
          d="M 580 275 C 520 275, 420 270, 350 270" 
          className="curved-line" 
          style={{ opacity: step >= 6 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
        <path 
          d="M 580 275 C 520 275, 420 270, 350 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 6 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
      </svg>
    </div>
  );
}
