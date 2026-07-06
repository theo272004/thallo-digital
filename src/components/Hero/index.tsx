'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

type Phase = 'phone' | 'burst' | 'collapse' | 'browse';

const TAB_COUNT = 4;
const PHONE_MS = 5000; // long enough for the phone's own type → think → answer beat
const BURST_MS = 900; // the 4 source cards pop out around the phone
const COLLAPSE_MS = 650; // cards fly into the browser's tabs; browser fades in under them
const TAB_MS = 2600; // each browser tab stays active this long

/**
 * A single looping sequence: the phone plays its query, the source cards
 * burst out around it, then fly into the matching tab of a browser window
 * (which fades in beneath them) — so the cards visually *become* the
 * navigation tabs. The browser then cycles Google → ChatGPT → Forbes →
 * Perplexity before the whole thing resets to the phone.
 */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('phone');
  const [tabIndex, setTabIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Pause the loop while the tab is hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Self-scheduling state machine — each phase queues the next.
  useEffect(() => {
    if (paused) return;
    const delay = phase === 'phone' ? PHONE_MS : phase === 'burst' ? BURST_MS : phase === 'collapse' ? COLLAPSE_MS : TAB_MS;

    const id = window.setTimeout(() => {
      if (phase === 'phone') setPhase('burst');
      else if (phase === 'burst') setPhase('collapse');
      else if (phase === 'collapse') {
        setTabIndex(0);
        setPhase('browse');
      } else {
        setTabIndex((i) => {
          const next = i + 1;
          if (next >= TAB_COUNT) {
            setPhase('phone');
            return 0;
          }
          return next;
        });
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [phase, tabIndex, paused]);

  // A soft "navigation" glide whenever the active surface changes.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      el,
      { scale: 0.99, rotateY: -4 },
      { scale: 1, rotateY: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
    );
  }, [phase, tabIndex]);

  // Gentle scroll parallax on the whole visual column (its only transform source).
  useEffect(() => {
    if (columnRef.current && containerRef.current) {
      initHeroAnimations(containerRef.current, columnRef.current, []);
    }
  }, []);

  const phoneVisible = phase === 'phone' || phase === 'burst';
  const browserVisible = phase === 'collapse' || phase === 'browse';
  const cardsPhase = phase === 'burst' ? 'burst' : phase === 'collapse' ? 'collapse' : 'hidden';
  const fade = 'transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-white border-b border-gray-100 flex items-center pt-32 pb-16 overflow-hidden"
    >
      <BackgroundGrid />

      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left — copy */}
        <HeroText />

        {/* Right — the phone plays a query, its source cards burst out, then fly into a browser's tabs */}
        <div
          ref={columnRef}
          className="relative w-full max-w-[720px] h-[420px] lg:h-[460px] mx-auto"
          style={{ perspective: '1400px' }}
        >
          <div className="hidden lg:block">
            <HeroSourceCards phase={cardsPhase} />
          </div>

          <div ref={stageRef} className="absolute inset-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
            {/* Phone */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                phoneVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <HeroPhoneScene active={phoneVisible} />
            </div>

            {/* Browser — always mounted (even invisible) so its tabs have real,
                measurable positions for the source cards to fly into. */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                browserVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <HeroBrowser activeIndex={tabIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
