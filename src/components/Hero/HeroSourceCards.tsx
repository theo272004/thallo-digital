'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const CARDS = [
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-0 -left-[3%]' },
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-[14%] -right-[3%]' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-[14%] -left-[3%]' },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-0 -right-[3%]' },
];

type CardsPhase = 'hidden' | 'burst' | 'gather';

/**
 * The four source cards — one per AI/search surface — fly OUT of the phone
 * one by one on `burst` (each animated from the phone's screen to its floating
 * spot, Apple-keynote style: soft shadow, small depth via scale, confident
 * easing), then on `gather` each one flies INTO the browser window, landing on
 * its own tab slot — so you literally watch the cards become the tabs.
 */
export default function HeroSourceCards({ phase }: { phase: CardsPhase }) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const tweens: gsap.core.Tween[] = [];

    if (phase === 'burst') {
      const phoneEl = document.getElementById('hero-phone-anchor');
      if (!phoneEl) return;
      const phoneRect = phoneEl.getBoundingClientRect();
      // Emerge from the phone's screen (upper area, where the results sit) so it
      // reads as the cards physically leaving the device.
      const origin = {
        x: phoneRect.left + phoneRect.width / 2,
        y: phoneRect.top + phoneRect.height * 0.3,
      };
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        if (!cardEl) return;
        const r = cardEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Emerge gradually: start bigger + partly-there, ease out gently over a
        // longer beat with a clear stagger, so you watch each card grow and glide
        // out of the phone rather than pop.
        tweens.push(
          gsap.fromTo(
            cardEl,
            { x: origin.x - cx, y: origin.y - cy, scale: 0.4, opacity: 0, rotateZ: (i % 2 ? 3 : -3) },
            { x: 0, y: 0, scale: 1, opacity: 1, rotateZ: 0, duration: 1.3, ease: 'power2.out', delay: i * 0.34 }
          )
        );
      });
    } else if (phase === 'gather') {
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        // Land on this card's own tab in the browser's tab strip.
        const tabEl = document.getElementById(`hero-tab-${c.key}`);
        if (!cardEl || !tabEl) return;
        const cr = cardEl.getBoundingClientRect();
        const tr = tabEl.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const tx = tr.left + tr.width / 2;
        const ty = tr.top + tr.height / 2;
        const d = i * 0.3; // stagger — keep in sync with GATHER_STAGGER (300ms)
        // 1) Glide to the tab and shrink to roughly the tab's footprint (156×73 →
        //    ~0.46 ≈ 72×34), staying fully opaque so you watch it travel and
        //    resize — the card is literally turning into a tab.
        tweens.push(
          gsap.to(cardEl, {
            x: tx - cx,
            y: ty - cy,
            scale: 0.46,
            rotateZ: 0,
            duration: 1.0, // keep in sync with CARD_FLIGHT_MS (1000ms)
            ease: 'power2.inOut',
            delay: d,
          })
        );
        // 2) Only in the last third of the flight does it dissolve — right as it
        //    overlaps the tab and the real tab blooms in underneath, so the
        //    hand-off reads as one continuous morph, not a card that vanishes.
        tweens.push(
          gsap.to(cardEl, { opacity: 0, duration: 0.34, ease: 'power1.in', delay: d + 0.66 })
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

  const show = phase === 'burst' || phase === 'gather';

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {CARDS.map((c) => (
        <div
          key={c.key}
          ref={(el) => {
            cardRefs.current[c.key] = el;
          }}
          className={`src-card absolute ${c.pos} w-[140px] 2xl:w-[156px] bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-2.5 ${
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
