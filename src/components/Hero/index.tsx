'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

// 0 = phone (animated query) · 1 Google · 2 ChatGPT · 3 Perplexity · 4 Dashboard
const SCENE_COUNT = 5;
const sceneDuration = (scene: number) => (scene === 0 ? 6200 : 2800);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);

  // Pause the loop while the tab is hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Self-scheduling advance — the phone beat lasts long enough to play out.
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setScene((s) => (s + 1) % SCENE_COUNT), sceneDuration(scene));
    return () => window.clearTimeout(id);
  }, [scene, paused]);

  // A soft "navigation" glide on each surface change (deliberate, not jittery).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      el,
      { scale: 0.99, rotateY: -4 },
      { scale: 1, rotateY: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
    );
  }, [scene]);

  // Gentle scroll parallax on the whole visual column (its only transform source).
  useEffect(() => {
    if (columnRef.current && containerRef.current) {
      initHeroAnimations(containerRef.current, columnRef.current, []);
    }
  }, []);

  const onPhone = scene === 0;
  const fade = 'transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-white border-b border-gray-100 flex items-center pt-28 pb-16 overflow-hidden"
    >
      <BackgroundGrid />

      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left — copy */}
        <HeroText />

        {/* Right — a query on the phone, then a browser navigating the surfaces */}
        <div
          ref={columnRef}
          className="relative w-full max-w-[720px] h-[420px] lg:h-[460px] mx-auto"
          style={{ perspective: '1400px' }}
        >
          <div className="hidden lg:block">
            <HeroSourceCards scene={scene} />
          </div>

          <div ref={stageRef} className="absolute inset-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
            {/* Phone (scene 0) */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                onPhone ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-[2px] pointer-events-none'
              }`}
            >
              <HeroPhoneScene active={onPhone} />
            </div>

            {/* Browser (scenes 1–4) */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${fade} ${
                onPhone ? 'opacity-0 scale-95 blur-[2px] pointer-events-none' : 'opacity-100 scale-100 blur-0'
              }`}
            >
              <HeroBrowser scene={onPhone ? 0 : scene - 1} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
