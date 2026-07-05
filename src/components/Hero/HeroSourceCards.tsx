'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

const CARDS = [
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-0 -left-[7%]', scene: 0 },
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-[14%] -right-[7%]', scene: 1 },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.svg', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-[14%] -left-[7%]', scene: 2 },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-0 -right-[6%]', scene: -1 },
];

/** Source cards around the browser — fast synchronized pop-in, active surface highlighted. */
export default function HeroSourceCards({ scene }: { scene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = ref.current!.querySelectorAll('.src-card');
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 18, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.6)', stagger: 0.08, delay: 0.25 }
      );
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-20">
      {CARDS.map((c) => {
        const on = scene === c.scene;
        return (
          <div
            key={c.key}
            className={`src-card absolute ${c.pos} w-[156px] bg-white rounded-2xl border p-3 flex items-center gap-2.5 transition-all duration-300 ${
              on
                ? 'border-[#39471D] shadow-[0_20px_44px_-18px_rgba(57,71,29,0.55)] -translate-y-0.5'
                : 'border-gray-100 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
              <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-gray-900 leading-tight">{c.name}</div>
              <div className={`text-[10px] font-semibold ${on ? 'text-[#39471D]' : 'text-gray-400'}`}>{c.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
