'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

type Phase = 'phone' | 'burst' | 'gather' | 'browse';

const TAB_COUNT = 4;
const PHONE_MS = 3600; // typing the query + loading + 4 source results appear
const BURST_MS = 2500; // the 4 source cards glide out, one by one, and hold
const GATHER_MS = 2200; // browser window is here (empty); cards fly INTO its tabs
const GATHER_STAGGER = 300; // gap between each card flying into the window
const CARD_FLIGHT_MS = 700; // how long a single card takes to reach its tab slot
const TAB_MS = 2600; // each browser tab stays active this long

/**
 * A single looping sequence: the phone types a query, the four source cards
 * fly out of it one by one (ChatGPT → Google → Perplexity → Forbes), hold,
 * then fly INTO the browser window one by one — each card landing on its own
 * tab, so you watch the cards become the tabs left to right — after which the
 * browser slides between each surface before the whole thing resets.
 */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('phone');
  const [tabIndex, setTabIndex] = useState(0);
  const [revealedTabs, setRevealedTabs] = useState(0);
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
    const delay =
      phase === 'phone' ? PHONE_MS :
      phase === 'burst' ? BURST_MS :
      phase === 'gather' ? GATHER_MS :
      TAB_MS;

    const id = window.setTimeout(() => {
      if (phase === 'phone') setPhase('burst');
      else if (phase === 'burst') {
        setRevealedTabs(0);
        setTabIndex(0);
        setPhase('gather');
      } else if (phase === 'gather') {
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

  // As each source card flies into the window (during `gather`), reveal the
  // matching tab right as the card lands — so the cards visibly *become* the
  // browser's tabs, left to right.
  useEffect(() => {
    if (phase !== 'gather' || paused) return;
    const ids: number[] = [];
    for (let i = 1; i <= TAB_COUNT; i++) {
      const landsAt = (i - 1) * GATHER_STAGGER + CARD_FLIGHT_MS - 120;
      ids.push(window.setTimeout(() => setRevealedTabs(i), landsAt));
    }
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [phase, paused]);

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
  const browserVisible = phase === 'gather' || phase === 'browse';
  const cardsPhase = phase === 'burst' ? 'burst' : phase === 'gather' ? 'gather' : 'hidden';
  const fade = 'transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-white border-b border-gray-100 flex items-center lg:items-stretch pt-32 pb-16 lg:pb-0 overflow-hidden"
    >
      <BackgroundGrid />

      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1 gap-12 items-center relative z-10 w-full lg:min-h-[calc(100vh-8rem)]">
        {/* Left — copy */}
        <HeroText />

        {/* Right — the phone types a query, its source cards fly out, then fly into a sliding tabbed browser */}
        <div
          ref={columnRef}
          className="relative w-full max-w-[720px] h-[420px] lg:h-[540px] mx-auto lg:self-end"
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
              <HeroPhoneScene active={phoneVisible} burst={phase === 'burst'} />
            </div>

            {/* Browser */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                browserVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <HeroBrowser activeIndex={tabIndex} revealedTabs={browserVisible ? revealedTabs : 0} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
