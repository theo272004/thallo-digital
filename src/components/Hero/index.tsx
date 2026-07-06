'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

type Phase = 'phone' | 'burst' | 'collapse' | 'tabsIntro' | 'browse';

const TAB_COUNT = 4;
const PHONE_MS = 3400; // typing the query + loading + 4 source results appear
const BURST_MS = 1900; // the 4 source cards fly out, one by one, and hold
const COLLAPSE_MS = 750; // cards fly back toward the phone
const TABS_INTRO_MS = 950; // the browser's tabs reveal left to right
const TAB_MS = 2400; // each browser tab stays active this long

/**
 * A single looping sequence: the phone types a query, the four source cards
 * fly out of it one by one (ChatGPT → Google → Perplexity → Forbes), hold,
 * then collapse back toward the phone as the interface turns into a tabbed
 * browser — its tabs revealing left to right — which then slides between
 * each surface before the whole thing resets to the phone.
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
      phase === 'collapse' ? COLLAPSE_MS :
      phase === 'tabsIntro' ? TABS_INTRO_MS :
      TAB_MS;

    const id = window.setTimeout(() => {
      if (phase === 'phone') setPhase('burst');
      else if (phase === 'burst') setPhase('collapse');
      else if (phase === 'collapse') {
        setRevealedTabs(0);
        setTabIndex(0);
        setPhase('tabsIntro');
      } else if (phase === 'tabsIntro') {
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

  // Reveal the browser's tabs one by one once we enter `tabsIntro`.
  useEffect(() => {
    if (phase !== 'tabsIntro' || paused) return;
    const ids: number[] = [];
    for (let i = 1; i <= TAB_COUNT; i++) {
      ids.push(window.setTimeout(() => setRevealedTabs(i), (i - 1) * 180));
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
  const browserVisible = phase === 'tabsIntro' || phase === 'browse';
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

        {/* Right — the phone types a query, its source cards fly out, then collapse into a sliding tabbed browser */}
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
