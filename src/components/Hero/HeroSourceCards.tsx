'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const CARDS = [
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-0 -left-[7%]' },
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-[14%] -right-[7%]' },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-[14%] -left-[7%]' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-0 -right-[6%]' },
];

type CardsPhase = 'hidden' | 'burst' | 'collapse';

/**
 * The four source cards that "burst" out around the phone once it has its
 * answer, then — on `collapse` — each one flies to the matching browser tab
 * (looked up by id, `hero-tab-<key>`) and shrinks into it, so the cards read
 * as becoming the browser's navigation tabs rather than just fading out.
 */
export default function HeroSourceCards({ phase }: { phase: CardsPhase }) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (phase !== 'collapse' || prefersReducedMotion()) return;
    const tweens: gsap.core.Tween[] = [];
    CARDS.forEach((c, i) => {
      const cardEl = cardRefs.current[c.key];
      const tabEl = document.getElementById(`hero-tab-${c.key}`);
      if (!cardEl || !tabEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();
      const dx = tabRect.left + tabRect.width / 2 - (cardRect.left + cardRect.width / 2);
      const dy = tabRect.top + tabRect.height / 2 - (cardRect.top + cardRect.height / 2);
      tweens.push(
        gsap.to(cardEl, {
          x: dx,
          y: dy,
          scale: 0.22,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
          delay: i * 0.035,
        })
      );
    });
    return () => tweens.forEach((t) => t.kill());
  }, [phase]);

  useEffect(() => {
    if (phase === 'hidden') {
      Object.values(cardRefs.current).forEach((el) => {
        if (el) gsap.set(el, { clearProps: 'x,y,scale,opacity' });
      });
    }
  }, [phase]);

  const show = phase === 'burst' || phase === 'collapse';

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {CARDS.map((c, i) => (
        <div
          key={c.key}
          ref={(el) => {
            cardRefs.current[c.key] = el;
          }}
          style={{ transitionDelay: show ? `${i * 70}ms` : '0ms' }}
          className={`src-card absolute ${c.pos} w-[156px] bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-2.5 transition-[opacity,transform] duration-[400ms] ease-out ${
            show
              ? 'opacity-100 translate-y-0 scale-100 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]'
              : 'opacity-0 translate-y-3 scale-95 shadow-none'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
            <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-gray-900 leading-tight">{c.name}</div>
            <div className="text-[11px] font-semibold text-gray-400">{c.tag}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
