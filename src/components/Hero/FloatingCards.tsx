import React from 'react';
import { useMouse } from '@/hooks/useMouse';
import CardGoogle from './CardGoogle';
import CardChatGPT from './CardChatGPT';
import CardPerplexity from './CardPerplexity';
import CardForbes from './CardForbes';

interface FloatingCardsProps {
  step: number;
}

export default function FloatingCards({ step }: FloatingCardsProps) {
  const mouse = useMouse();

  // Create subtle, independent parallax translation styles for each card depth layer
  const parallaxGoogle = {
    transform: `translate(${mouse.x * 20}px, ${mouse.y * 20}px) ${step >= 3 ? 'scale(1)' : 'scale(0.9)'}`,
    zIndex: 15
  };

  const parallaxChatGPT = {
    transform: `translate(${mouse.x * 35}px, ${mouse.y * 35}px) ${step >= 3 ? 'scale(1)' : 'scale(0.9)'}`,
    zIndex: 15
  };

  const parallaxPerplexity = {
    transform: `translate(${mouse.x * 25}px, ${mouse.y * 25}px) ${step >= 3 ? 'scale(1)' : 'scale(0.9)'}`,
    zIndex: 15
  };

  const parallaxForbes = {
    transform: `translate(${mouse.x * 30}px, ${mouse.y * 30}px) ${step >= 3 ? 'scale(1)' : 'scale(0.9)'}`,
    zIndex: 15
  };

  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 15 }}>
      <CardGoogle step={step} parallaxStyle={parallaxGoogle} />
      <CardChatGPT step={step} parallaxStyle={parallaxChatGPT} />
      <CardPerplexity step={step} parallaxStyle={parallaxPerplexity} />
      <CardForbes step={step} parallaxStyle={parallaxForbes} />
    </div>
  );
}
