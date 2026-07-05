'use client';
import React from 'react';

interface ConnectionLinesProps {
  step: number;
}

export default function ConnectionLines({ step }: ConnectionLinesProps) {
  // Pair 1: Google + ChatGPT appear at step 3
  // Pair 2: Perplexity + Forbes appear at step 5
  return (
    <div className="connector-svg-container">
      <svg viewBox="0 0 700 500" className="w-full h-full">
        {/* ── Google (top-left) ──────────────────────── */}
        <path
          d="M 70 90 C 100 200, 260 250, 350 272"
          className="curved-line"
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
        <path
          d="M 70 90 C 100 200, 260 250, 350 272"
          className="curved-line animated-trail"
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />

        {/* ── ChatGPT (top-right) ────────────────────── */}
        <path
          d="M 630 85 C 600 195, 440 250, 350 272"
          className="curved-line"
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
        <path
          d="M 630 85 C 600 195, 440 250, 350 272"
          className="curved-line animated-trail"
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />

        {/* ── Perplexity (mid-left) ─────────────────── */}
        <path
          d="M 80 268 C 180 268, 280 270, 350 270"
          className="curved-line"
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
        <path
          d="M 80 268 C 180 268, 280 270, 350 270"
          className="curved-line animated-trail"
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />

        {/* ── Forbes (mid-right) ────────────────────── */}
        <path
          d="M 620 275 C 520 275, 420 270, 350 270"
          className="curved-line"
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
        <path
          d="M 620 275 C 520 275, 420 270, 350 270"
          className="curved-line animated-trail"
          style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
      </svg>
    </div>
  );
}
