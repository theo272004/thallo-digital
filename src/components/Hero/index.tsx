'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
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
const PHONE_MS = 2400; // typing the query + loading + 4 source results appear
const BURST_MS = 1900; // the 4 source cards glide out, one by one, and hold
const GATHER_MS = 1700; // browser window is here; cards morph INTO its tabs (just covers the morph, so tab-switching starts sooner)
const GATHER_STAGGER = 240; // gap between each card flying into the window
const CARD_FLIGHT_MS = 700; // how long a single card takes to reach + dissolve into its tab
const TAB_MS = 1500; // each browser tab stays active this long (snappier switching)
/**
 * How long the FIRST tab holds, and it is shorter than the rest on purpose.
 *
 * ChatGPT is already the active tab throughout `gather` — it is the tab the
 * cards assemble around — so at a flat `TAB_MS` it was on screen for
 * GATHER_MS + TAB_MS, 3200ms against 1500 for the other three. More than twice
 * as long, and the second half of it perfectly still, which is what made it
 * feel stuck. This buys the finished window a beat to settle and then moves on.
 */
const FIRST_TAB_MS = 650;

/** Module-level so the reference is stable across renders. */
const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

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
  // Pause the loop while the tab is hidden. Page visibility is an external
  // store, so read it as one — mirroring it into state meant a setState in an
  // effect body, and a cascading render on every mount.
  const paused = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  // Self-scheduling state machine — each phase queues the next.
  useEffect(() => {
    if (paused) return;
    const delay =
      phase === 'phone' ? PHONE_MS :
      phase === 'burst' ? BURST_MS :
      phase === 'gather' ? GATHER_MS :
      tabIndex === 0 ? FIRST_TAB_MS :
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

  /* A soft "navigation" glide when the browser switches tabs — ONLY while
     browsing. During burst/gather the stage must stay perfectly still: any 3D
     transform here would skew the measured positions the cards fly from/to,
     making them land visibly off their tabs.

     ## Why it used to fire twice on the first tab

     The effect keyed on `[phase, tabIndex]`, so entering `browse` counted as a
     change even though the tab had not moved — it was still tab 0, ChatGPT. On
     every other tab the glide coincided with a tab actually switching and read
     as one motion; on ChatGPT it landed right after the cards had finished
     assembling into the window, with nothing to explain it. Two movements back
     to back on the same view, which is exactly what it looked like.

     `lastGlided` holds the tab the glide last ran for. Entering `browse` seeds
     it without animating, so the first thing the glide ever responds to is a
     real tab change. */
  const lastGlided = useRef<number | null>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || phase !== 'browse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (phase !== 'browse') lastGlided.current = null;
      return;
    }
    if (lastGlided.current === null) {
      lastGlided.current = tabIndex;
      return;
    }
    if (lastGlided.current === tabIndex) return;
    lastGlided.current = tabIndex;

    /* Softer and longer than it was: -2.5° instead of -4, a scale that only
       dips to .996, and 1.1s on `power3.out` rather than .8 on `power2.out`.
       The old one covered more distance in less time on a shallower curve,
       which is what made it read as a knock rather than a glide. */
    gsap.fromTo(
      el,
      { scale: 0.996, rotateY: -2.5 },
      { scale: 1, rotateY: 0, duration: 1.1, ease: 'power3.out', overwrite: true }
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
          className="relative w-full max-w-[720px] h-[420px] lg:h-[min(460px,58vh)] 2xl:h-[min(540px,64vh)] mx-auto lg:self-end lg:mb-[clamp(3.5rem,13vh,8.75rem)]"
          style={{ perspective: '1400px' }}
        >
          {/* The stage stops short of the bottom of the column: the last 28px
              belong to the disclaimer below it, so nothing in the animation can
              ever land on top of the line that says the animation is a mock-up. */}
          <div className="hidden lg:block absolute inset-x-0 top-0 bottom-7">
            <HeroSourceCards phase={cardsPhase} />
          </div>

          <div ref={stageRef} className="absolute inset-x-0 top-0 bottom-7 z-10" style={{ transformStyle: 'preserve-3d' }}>
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
                sits in the middle of the space, not the bottom third). It enters
                with a pure fade — no scale — so its tabs are at their exact final
                position from the first frame and the cards land dead-on. */}
            <div
              className={`absolute inset-0 flex items-center justify-center 2xl:pb-[120px] ${fade} ${
                browserVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <HeroBrowser activeIndex={tabIndex} revealedTabs={browserVisible ? revealedTabs : 0} />
            </div>
          </div>

          {/*
            Says out loud what the animation is.

            Every answer in this sequence is written by us: the ChatGPT reply,
            the Google AI Overview, the Perplexity summary and the Forbes
            article are designed to look exactly like the real products, down
            to the chrome and the logos, and none of them happened. On a site
            whose entire argument is that accuracy and citation are what earn
            trust, a reader who works that out for themselves has found us
            doing the thing we sell against — so the page tells them first.

            Not `aria-hidden`: a screen reader gets the mock-up's text read out
            as ordinary prose, with none of the visual cues that mark it as a
            picture of a browser, so it is the reader who most needs the label.
          */}
          <p className="absolute inset-x-0 bottom-0 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Illustrative example · not real AI output
          </p>
        </div>
      </div>

      {/* Ticker hidden provisionally */}
    </section>
  );
}
