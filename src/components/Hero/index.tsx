'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhoneScene from './HeroPhoneScene';
import HeroBrowser from './HeroBrowser';
import HeroSourceCards from './HeroSourceCards';
import { initHeroAnimations } from './HeroAnimations';
import { gsap } from '@/lib/gsap';

// 0 = phone (opening query) · 1 Google · 2 ChatGPT · 3 Perplexity · 4 Dashboard
const SCENE_COUNT = 5;
const SCENE_MS = 2600;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);

  // Auto-advance across the surfaces, looping — paused while the tab is hidden.
  useEffect(() => {
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(() => setScene((s) => (s + 1) % SCENE_COUNT), SCENE_MS);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVis = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // A deliberate "navigation" pulse on each surface change (not idle jitter).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      el,
      { scale: 0.985, rotateY: -5 },
      { scale: 1, rotateY: 0, duration: 0.6, ease: 'power3.out', overwrite: true }
    );
  }, [scene]);

  // Gentle scroll parallax on the whole visual column (its only transform source).
  useEffect(() => {
    if (columnRef.current && containerRef.current) {
      initHeroAnimations(containerRef.current, columnRef.current, []);
    }
  }, []);

  const onPhone = scene === 0;

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
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                onPhone ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <HeroPhoneScene />
            </div>

            {/* Browser (scenes 1–4) */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                onPhone ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
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
