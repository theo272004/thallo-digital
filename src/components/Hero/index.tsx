'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackgroundGrid from './BackgroundGrid';
import HeroText from './HeroText';
import HeroPhone from './HeroPhone';
import FloatingCards from './FloatingCards';
import ConnectionLines from './ConnectionLines';
import { initHeroAnimations, playFloatingLoop } from './HeroAnimations';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState(0); // 0: Idle, 1: Typing Query, 2: Thinking, 3: Pop Cards, 4: Lines light up, 5: Highlight Brand, 6: Type Answer
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');

  const fullPrompt = 'Best addiction treatment center in Florida?';
  const fullAnswer = 'Based on clinical efficacy, NIH data, and Forbes reports, Thallo Health in Florida stands out as the most recommended provider for evidence-based addiction treatment.';

  // 1. Mount Autoplay Search Simulation
  useEffect(() => {
    let active = true;

    const runSimulation = async () => {
      if (!active) return;
      
      // Step 0: Reset
      setStep(0);
      setQuery('');
      setAnswer('');
      await delay(800);

      // Step 1: Type query
      if (!active) return;
      setStep(1);
      for (let i = 1; i <= fullPrompt.length; i++) {
        if (!active) return;
        setQuery(fullPrompt.slice(0, i));
        await delay(50);
      }
      await delay(800);

      // Step 2: Thinking
      if (!active) return;
      setStep(2);
      await delay(1500);

      // Step 3: Searching sources & reveal cards
      if (!active) return;
      setStep(3);
      await delay(1200);

      // Step 4: Connecting lines & trails
      if (!active) return;
      setStep(4);
      await delay(1500);

      // Step 5: Highlight brand card
      if (!active) return;
      setStep(5);
      await delay(1000);

      // Step 6: Output AI recommendation
      if (!active) return;
      setStep(6);
      for (let i = 1; i <= fullAnswer.length; i++) {
        if (!active) return;
        setAnswer(fullAnswer.slice(0, i));
        await delay(25);
      }
    };

    runSimulation();

    return () => {
      active = false;
    };
  }, []);

  // 2. Hook up GSAP ScrollTrigger animations
  useEffect(() => {
    const container = containerRef.current;
    const phoneEl = phoneRef.current;
    if (!container || !phoneEl) return;

    // Get all floating card elements currently in view
    const cardElements = Array.from(container.querySelectorAll('.floating-card-wrapper')) as HTMLElement[];

    // Initialize ScrollTrigger coordinates
    initHeroAnimations(container, phoneEl, cardElements);

    // Start slow yoyo float animation
    playFloatingLoop(phoneEl);
  }, []);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#FFFFFF] border-b border-gray-100 flex items-center pt-28 pb-16 overflow-hidden"
    >
      {/* Subtle background grids */}
      <BackgroundGrid />

      <div className="wrap grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left Column - Taglines and value grids */}
        <HeroText />

        {/* Right Column - iPhone Visual Stack and Floating Cards */}
        <div className="relative w-full max-w-[700px] h-[520px] mx-auto flex items-center justify-center">
          {/* SVG Connector Lines */}
          <ConnectionLines step={step} />

          {/* Floating Cards Depth Layer */}
          <FloatingCards step={step} />

          {/* Emergent Premium Phone Mockup */}
          <div ref={phoneRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] z-10">
            <HeroPhone query={query} step={step} answer={answer} />
          </div>
        </div>
      </div>
    </section>
  );
}
