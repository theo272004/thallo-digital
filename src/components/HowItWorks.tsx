'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

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
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Organic SVG Growth Stem */}
        <div className="flex justify-center items-center h-[460px]">
          <svg viewBox="0 0 200 500" className="w-full max-w-[220px] h-full" style={{ overflow: 'visible' }}>
            <path 
              ref={stemRef}
              className="stem fill-none stroke-gray-200" 
              strokeWidth="2.5"
              strokeLinecap="round"
              d="M 100,470 C 100,350 100,200 100,30 M 100,370 C 65,330 40,300 30,260 M 100,250 C 135,210 160,180 170,140 M 100,130 C 70,100 50,75 40,50"
            />
            {/* Organic Leaves */}
            <g ref={leaf1Ref} style={{ transformOrigin: '30px 260px' }} className="origin-center">
              <path 
                d="M 30,260 C 24,250 18,245 30,232 C 42,245 36,250 30,260 Z" 
                className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[1.5]"
                transform="rotate(-25 30 260)"
              />
            </g>
            <g ref={leaf2Ref} style={{ transformOrigin: '170px 140px' }} className="origin-center">
              <path 
                d="M 170,140 C 164,130 158,125 170,112 C 182,125 176,130 170,140 Z" 
                className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[1.5]"
                transform="rotate(35 170 140)"
              />
            </g>
            <g ref={leaf3Ref} style={{ transformOrigin: '40px 50px' }} className="origin-center">
              <path 
                d="M 40,50 C 34,40 28,35 40,22 C 52,35 46,40 40,50 Z" 
                className="leaf fill-[#39471D] stroke-[#FFFFFF] stroke-[1.5]"
                transform="rotate(-25 40 50)"
              />
            </g>
          </svg>
        </div>

        {/* Right Column: Steps Stepper */}
        <div className="flex flex-col gap-10">
          <div className="mb-6">
            <Eyebrow className="mb-5">Our Method</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
              html="How we build AI visibility."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch]">
              A systematic B2B authority building process that converts search queries into revenue-generating recommendations.
            </p>
          </div>

          <div ref={step1Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1">STEP 01</div>
            <div>
              <h3 className="text-md font-bold text-gray-900 mb-2">Audit & Visibility Mapping</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We audit your search presence across ChatGPT, Perplexity, and Google AI Overview. We compile a prioritized action plan.
              </p>
            </div>
          </div>

          <div ref={step2Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1">STEP 02</div>
            <div>
              <h3 className="text-md font-bold text-gray-900 mb-2">Authority Infrastructure</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We construct the content assets, research databases, and technical schemas required for AI crawlers to catalog your brand.
              </p>
            </div>
          </div>

          <div ref={step3Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1">STEP 03</div>
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
