import React from 'react';

interface ConnectionLinesProps {
  step: number;
}

export default function ConnectionLines({ step }: ConnectionLinesProps) {
  return (
    <div className="connector-svg-container">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {/* Google -> Phone Top Bezel */}
        <path d="M 160 105 C 160 180, 200 240, 250 270" className="curved-line" />
        <path 
          d="M 160 105 C 160 180, 200 240, 250 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* ChatGPT -> Phone Top Bezel */}
        <path d="M 385 85 C 385 160, 300 240, 250 270" className="curved-line" />
        <path 
          d="M 385 85 C 385 160, 300 240, 250 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* Perplexity -> Phone Top Bezel */}
        <path d="M 170 275 C 200 275, 220 270, 250 270" className="curved-line" />
        <path 
          d="M 170 275 C 200 275, 220 270, 250 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />

        {/* Forbes -> Phone Top Bezel */}
        <path d="M 400 285 C 360 285, 280 270, 250 270" className="curved-line" />
        <path 
          d="M 400 285 C 360 285, 280 270, 250 270" 
          className="curved-line animated-trail" 
          style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}
        />
      </svg>
    </div>
  );
}
