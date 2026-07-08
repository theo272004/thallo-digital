'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

const LOGOS = ['Meridian', 'Northwind', 'Calderon & Co', 'Vireo Health', 'Ledgerly', 'Ashfield'];
const TICKER = [...LOGOS, ...LOGOS, ...LOGOS];

type Phase = 'phone' | 'burst' | 'gather' | 'browse';

const TAB_COUNT = 4;
const PHONE_MS = 3600; // typing the query + loading + 4 source results appear
const BURST_MS = 2600; // the 4 source cards glide out, one by one, and hold
const GATHER_MS = 2500; // browser window is here; cards morph INTO its tabs
const GATHER_STAGGER = 300; // gap between each card flying into the window
const CARD_FLIGHT_MS = 1000; // how long a single card takes to reach + dissolve into its tab
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
      // Reveal each tab right as its card begins dissolving (~68% through the
      // flight), so the tab blooms in underneath while the card fades out.
      const landsAt = (i - 1) * GATHER_STAGGER + CARD_FLIGHT_MS * 0.68;
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
  const fade = 'transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-white border-b border-gray-100 flex flex-col pt-24 overflow-hidden"
    >
      <BackgroundGrid />

      <div className="flex-1 max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full py-4 lg:py-8">
        {/* Left — copy */}
        <HeroText />

        {/* Right — the phone types a query, its source cards fly out, then fly into a sliding tabbed browser */}
        <div
          ref={columnRef}
          className="relative w-full max-w-[720px] h-[420px] lg:h-[min(460px,58vh)] 2xl:h-[min(540px,64vh)] mx-auto lg:self-end lg:mb-4"
          style={{ perspective: '1400px' }}
        >
          <div className="hidden lg:block absolute inset-0">
            <HeroSourceCards phase={cardsPhase} />
          </div>

          <div ref={stageRef} className="absolute inset-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
            {/* Phone — recedes gently (small scale + slight upward drift) as it
                hands off to the browser, instead of snapping away */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                phoneVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.96] -translate-y-3 pointer-events-none'
              }`}
            >
              <HeroPhoneScene active={phoneVisible} burst={phase === 'burst'} />
            </div>

            {/* Browser — raised on desktop (pb pushes the centered window up so it
                sits in the middle of the space, not the bottom third) */}
            <div
              className={`absolute inset-0 flex items-center justify-center 2xl:pb-[120px] ${fade} ${
                browserVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97] pointer-events-none'
              }`}
            >
              <HeroBrowser activeIndex={tabIndex} revealedTabs={browserVisible ? revealedTabs : 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Ticker — anchored at the bottom of the hero above the fold */}
      <div className="relative z-10 w-full pb-8 pt-2">
        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-center uppercase text-gray-400 mb-5">
          Cited across the answers your buyers trust
        </p>
        <div className="overflow-hidden flex">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {TICKER.map((name, i) => (
              <span key={i} className="text-gray-400 text-sm font-bold tracking-wider">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
