'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const leaf1Ref = useRef<SVGCircleElement>(null);
  const leaf2Ref = useRef<SVGCircleElement>(null);
  const leaf3Ref = useRef<SVGCircleElement>(null);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    if (!stem) return;

    const length = stem.getTotalLength();
    gsap.set(stem, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    // Initialize leaves to zero scale/opacity
    gsap.set([leaf1Ref.current, leaf2Ref.current, leaf3Ref.current], {
      scale: 0,
      opacity: 0
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'bottom 90%',
        scrub: 0.8
      }
    });

    tl.to(stem, {
      strokeDashoffset: 0,
      ease: 'none'
    });

    // Populate leaf nodes on step elements scroll
    const leafConfigs = [
      { trigger: step1Ref, leaf: leaf1Ref },
      { trigger: step2Ref, leaf: leaf2Ref },
      { trigger: step3Ref, leaf: leaf3Ref }
    ];

    leafConfigs.forEach((cfg) => {
      if (cfg.leaf.current && cfg.trigger.current) {
        ScrollTrigger.create({
          trigger: cfg.trigger.current,
          start: 'top 75%',
          end: 'bottom 75%',
          onEnter: () => {
            gsap.to(cfg.leaf.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
            cfg.trigger.current?.classList.add('opacity-100');
            cfg.trigger.current?.classList.remove('opacity-40');
          },
          onLeaveBack: () => {
            gsap.to(cfg.leaf.current, { scale: 0.2, opacity: 0, duration: 0.3 });
            cfg.trigger.current?.classList.remove('opacity-100');
            cfg.trigger.current?.classList.add('opacity-40');
          }
        });
      }
    });
  }, []);

  return (
    <section className="bg-white py-24 border-b border-gray-100" id="approach" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Organic SVG Growth Stem */}
        <div className="flex justify-center items-center h-[380px]">
          <svg viewBox="0 0 200 400" className="w-full max-w-[220px] h-full" style={{ overflow: 'visible' }}>
            <path 
              ref={stemRef}
              className="stem fill-none stroke-gray-200" 
              strokeWidth="2.5"
              strokeLinecap="round"
              d="M 100,380 C 100,300 100,200 100,50 M 100,300 C 60,260 40,240 40,220 M 100,200 C 140,160 160,140 160,120 M 100,100 C 70,70 50,50 50,40"
            />
            {/* Organic Leaves */}
            <circle 
              ref={leaf1Ref}
              className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[2]"
              cx="40" 
              cy="220" 
              r="7" 
              style={{ transformOrigin: '40px 220px' }}
            />
            <circle 
              ref={leaf2Ref}
              className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[2]"
              cx="160" 
              cy="120" 
              r="7" 
              style={{ transformOrigin: '160px 120px' }}
            />
            <circle 
              ref={leaf3Ref}
              className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[2]"
              cx="50" 
              cy="40" 
              r="7" 
              style={{ transformOrigin: '50px 40px' }}
            />
          </svg>
        </div>

        {/* Right Column: Steps Stepper */}
        <div className="flex flex-col gap-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]"></span>
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">Our Method</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 mb-6 font-sans">
              How we build AI visibility.
            </h2>
            <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[45ch]">
              A systematic B2B authority building process that converts search queries into revenue-generating recommendations.
            </p>
          </div>

          <div ref={step1Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[10px] font-mono font-bold text-gray-400 mt-1">STEP 01</div>
            <div>
              <h3 className="text-md font-bold text-gray-900 mb-2">Audit & Visibility Mapping</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We audit your search presence across ChatGPT, Perplexity, and Google AI Overview. We compile a prioritized action plan.
              </p>
            </div>
          </div>

          <div ref={step2Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[10px] font-mono font-bold text-gray-400 mt-1">STEP 02</div>
            <div>
              <h3 className="text-md font-bold text-gray-900 mb-2">Authority Infrastructure</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We construct the content assets, research databases, and technical schemas required for AI crawlers to catalog your brand.
              </p>
            </div>
          </div>

          <div ref={step3Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[10px] font-mono font-bold text-gray-400 mt-1">STEP 03</div>
            <div>
              <h3 className="text-md font-bold text-gray-900 mb-2">Expert Distribution & Seed</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We seed your insights across authority nodes. Conversational models synthesize these nodes, citation by citation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
