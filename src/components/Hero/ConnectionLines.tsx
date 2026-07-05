import React from 'react';

interface ConnectionLinesProps {
  step: number;
}

export default function ConnectionLines({ step }: ConnectionLinesProps) {
  return (
    <div className="connector-svg-container">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Google -> Phone Top Bezel */}
        <path d="M 25 25 Q 32 55 50 75" className="curved-line" />
        <path 
          d="M 25 25 Q 32 55 50 75" 
          className={`curved-line animated-trail transition-opacity duration-500`} 
          style={{ opacity: step >= 4 ? 1 : 0 }}
        />

        {/* ChatGPT -> Phone Top Bezel */}
        <path d="M 70 20 Q 60 52 50 75" className="curved-line" />
        <path 
          d="M 70 20 Q 60 52 50 75" 
          className={`curved-line animated-trail transition-opacity duration-500`} 
          style={{ opacity: step >= 4 ? 1 : 0 }}
        />

        {/* Perplexity -> Phone Top Bezel */}
        <path d="M 26 55 Q 36 68 50 75" className="curved-line" />
        <path 
          d="M 26 55 Q 36 68 50 75" 
          className={`curved-line animated-trail transition-opacity duration-500`} 
          style={{ opacity: step >= 4 ? 1 : 0 }}
        />

        {/* Forbes -> Phone Top Bezel */}
        <path d="M 74 60 Q 62 70 50 75" className="curved-line" />
        <path 
          d="M 74 60 Q 62 70 50 75" 
          className={`curved-line animated-trail transition-opacity duration-500`} 
          style={{ opacity: step >= 4 ? 1 : 0 }}
        />
      </svg>
    </div>
  );
}
