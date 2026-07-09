'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

// Resting spots pull OUT past the column edges so the cards sit clearly apart
// from the phone/browser (which stay centered). 6% still lands inside the
// section on laptop-width screens (the column sits ~24px in from the viewport),
// so the right/bottom cards don't clip.
const CARDS = [
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-0 -left-[6%]' },
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-[14%] -right-[6%]' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-[14%] -left-[6%]' },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-0 -right-[6%]' },
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

  // NOTE: this choreography runs regardless of prefers-reduced-motion. Many
  // Windows laptops ship with "animation effects" off, which silently skipped
  // the whole sequence: rows faded into nothing and the cards popped in all at
  // once. The hero demo is core content, not decoration — decorative motion
  // elsewhere (parallax, glides) still honors the OS setting.
  useLayoutEffect(() => {
    const tweens: gsap.core.Tween[] = [];

    if (phase === 'burst') {
      const phoneEl = document.getElementById('hero-phone-anchor');
      if (!phoneEl) return;
      const phoneRect = phoneEl.getBoundingClientRect();
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        if (!cardEl) return;
        const r = cardEl.getBoundingClientRect(); // natural (final) size & spot
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = i * 0.34; // matches the row lift-out delay in HeroPhoneScene

        // Morph FROM the matching result row inside the phone: the card starts
        // exactly where the row sits, at the row's elongated size, then shrinks
        // and glides to its floating spot — so the row visibly *becomes* the
        // compact card, one continuous shape the whole way.
        //
        // IMPORTANT: the start offset aligns EDGES (left/top), not centers.
        // Width/height are also tweening, and GSAP anchors an element at its
        // left edge — center math computed against the natural size made the
        // card spawn ~half-a-row to the right and "swing back", a visible
        // dart in the wrong direction. Edge-aligned starts + equal easing on
        // x and width keep both card edges moving monotonically toward the
        // final spot: it just shrinks *toward where it's going*.
        const rowEl = document.getElementById(`hero-result-${c.key}`);
        const row = rowEl ? rowEl.getBoundingClientRect() : null;
        // Cards on the right/bottom are CSS-anchored by `right`/`bottom`, so
        // when the from-state applies the row's larger width/height their
        // layout origin shifts (the anchored edge stays pinned and the free
        // edge grows the "wrong" way). Compensate by the size delta, or those
        // cards spawn offset toward the opposite side and visibly swing back —
        // exactly the dart we already fixed for the left-anchored ones.
        const anchoredRight = c.pos.includes('right');
        const anchoredBottom = c.pos.includes('bottom');
        const from = row
          ? {
              x: row.left - r.left + (anchoredRight ? row.width - r.width : 0),
              y: row.top - r.top + (anchoredBottom ? row.height - r.height : 0),
              width: row.width,
              height: row.height,
            }
          : {
              x: phoneRect.left + phoneRect.width / 2 - cx,
              y: phoneRect.top + phoneRect.height * 0.3 - cy,
              scale: 0.4,
            };

        tweens.push(
          gsap.fromTo(
            cardEl,
            { ...from },
            {
              x: 0,
              y: 0,
              width: r.width,
              height: r.height,
              scale: 1,
              duration: 1.2,
              ease: 'power3.inOut',
              delay: d,
              clearProps: 'width,height',
            }
          )
        );
        // Fade in fast at the start of the flight — the card takes over right
        // as its row lifts out, so the hand-off reads as one continuous shape.
        tweens.push(
          gsap.fromTo(cardEl, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out', delay: d })
        );
      });
    } else if (phase === 'gather') {
      CARDS.forEach((c, i) => {
        const cardEl = cardRefs.current[c.key];
        // Land on this card's own tab in the browser's tab strip.
        const tabEl = document.getElementById(`hero-tab-${c.key}`);
        if (!cardEl || !tabEl) return;
        // The card rests untransformed at gather start, so its base center is
        // stable — measure it once now.
        const cr = cardEl.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const d = i * 0.3; // stagger — keep in sync with GATHER_STAGGER (300ms)
        // 1) Glide to the tab and shrink to roughly the tab's footprint,
        //    staying fully opaque so you watch it travel and resize — the card
        //    is literally turning into a tab. The target is FUNCTION-BASED:
        //    GSAP resolves it at take-off (after the delay), so each card aims
        //    at the tab's true position in that exact moment.
        tweens.push(
          gsap.to(cardEl, {
            x: () => {
              const tr = tabEl.getBoundingClientRect();
              return tr.left + tr.width / 2 - cx;
            },
            y: () => {
              const tr = tabEl.getBoundingClientRect();
              return tr.top + tr.height / 2 - cy;
            },
            scale: 0.46,
            rotateZ: 0,
            duration: 0.9, // keep in sync with CARD_FLIGHT_MS (900ms)
            ease: 'power2.inOut',
            delay: d,
          })
        );
        // 2) Only in the last third of the flight does it dissolve — right as it
        //    overlaps the tab and the real tab blooms in underneath, so the
        //    hand-off reads as one continuous morph, not a card that vanishes.
        tweens.push(
          gsap.to(cardEl, { opacity: 0, duration: 0.3, ease: 'power1.in', delay: d + 0.6 })
        );
      });
    }
    return () => tweens.forEach((t) => t.kill());
  }, [phase]);

  useEffect(() => {
    if (phase === 'hidden') {
      Object.values(cardRefs.current).forEach((el) => {
        if (el) gsap.set(el, { clearProps: 'x,y,scale,opacity,width,height' });
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
          className={`src-card absolute ${c.pos} w-[156px] overflow-hidden bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-2.5 ${
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
