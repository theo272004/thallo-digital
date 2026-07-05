import React from 'react';
import CardGoogle from './CardGoogle';
import CardChatGPT from './CardChatGPT';
import CardPerplexity from './CardPerplexity';
import CardForbes from './CardForbes';

interface FloatingCardsProps {
  step: number;
}

/**
 * Source cards fade + scale in on `step` via their own CSS transitions.
 * No cursor tracking — the cards stay put (kept intentionally still).
 */
export default function FloatingCards({ step }: FloatingCardsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 15 }}>
      <CardGoogle step={step} />
      <CardChatGPT step={step} />
      <CardPerplexity step={step} />
      <CardForbes step={step} />
    </div>
  );
}
