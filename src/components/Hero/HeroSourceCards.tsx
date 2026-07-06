'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const CARDS = [
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-0 -left-[7%]' },
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-[14%] -right-[7%]' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-[14%] -left-[7%]' },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-0 -right-[6%]' },
];

type CardsPhase = 'hidden' | 'burst' | 'collapse';

/**
 * The four source cards — one per AI/search surface — fly out of the phone
 * one by one on `burst` (each animated from the phone's own position to its
 * floating spot, Apple-keynote style: soft shadow, small depth via scale,
 * confident easing), then collapse back toward the phone on `collapse`
 * before the interface becomes a tabbed browser.
 */
export default function HeroSourceCards({ phase }: { phase: CardsPhase }) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const phoneEl = document.getElementById('hero-phone-anchor');
    if (!phoneEl) return;
    const phoneRect = phoneEl.getBoundingClientRect();
    const phoneCenter = { x: phoneRect.left + phoneRect.width / 2, y: phoneRect.top + phoneRect.height / 2 };
    const tweens: gsap.core.Tween[] = [];

    if (phase === 'burst') {
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        if (!cardEl) return;
        const r = cardEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        tweens.push(
          gsap.fromTo(
            cardEl,
            { x: phoneCenter.x - cx, y: phoneCenter.y - cy, scale: 0.3, opacity: 0 },
            { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out', delay: i * 0.12 }
          )
        );
      });
    } else if (phase === 'collapse') {
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        if (!cardEl) return;
        const r = cardEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        tweens.push(
          gsap.to(cardEl, {
            x: phoneCenter.x - cx,
            y: phoneCenter.y - cy,
            scale: 0.25,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            delay: i * 0.06,
          })
        );
      });
    }
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
      {CARDS.map((c) => (
        <div
          key={c.key}
          ref={(el) => {
            cardRefs.current[c.key] = el;
          }}
          className={`src-card absolute ${c.pos} w-[156px] bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-2.5 ${
            show ? 'opacity-100 shadow-[0_24px_50px_-24px_rgba(30,34,20,0.35)]' : 'opacity-0 shadow-none'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
            <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-gray-900 leading-tight">{c.name}</div>
            <div className="text-[11px] font-semibold text-[#758061]">{c.tag}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
