'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ResultsDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const floatCard1Ref = useRef<HTMLDivElement>(null);
  const floatCard2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Line path drawing animation
    const line = lineRef.current;
    if (line) {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1
        }
      });
    }

    // 2. Bar heights growing animation
    gsap.to(bar1Ref.current, {
      height: '35px',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar1Ref.current,
        start: 'top 85%'
      }
    });

    gsap.to(bar2Ref.current, {
      height: '185px',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar2Ref.current,
        start: 'top 85%'
      }
    });

    // 3. Parallax scroll effect for floating info cards
    gsap.to(floatCard1Ref.current, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    gsap.to(floatCard2Ref.current, {
      y: -90,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  }, []);

  return (
    <section className="bg-gray-50/50 py-24 border-b border-gray-100 relative overflow-hidden" id="results" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16 mx-auto text-center">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]"></span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">Tracked Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 mb-6 font-sans">
            Visualizing authority compounding.
          </h2>
          <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[45ch] mx-auto">
            We build visibility that conversational engines and AI recommend models parse, map, and cite consistently.
          </p>
        </div>

        {/* Dashboard Mockup Panel */}
        <div className="relative max-w-4xl mx-auto z-10">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.06)] overflow-hidden">
            
            {/* Header controls bar */}
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-2 bg-gray-50/40">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
              <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase ml-4">
                Citations Analytics
              </span>
            </div>

            {/* Screen layout */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Line Chart */}
              <div>
                <span className="text-[9px] font-bold text-gray-400 block tracking-widest mb-1">TOTAL CITATIONS</span>
                <span className="text-2xl font-bold text-gray-900 block mb-2">+540%</span>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-6">
                  Compound Monthly Citation growth index across ChatGPT, Claude and Perplexity.
                </p>
                
                <svg viewBox="0 0 400 200" className="w-full h-[150px] overflow-visible">
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="160" x2="400" y2="160" stroke="#f3f4f6" strokeWidth="1" />
                  <path 
                    ref={lineRef}
                    d="M 10,160 Q 90,150 170,110 T 310,60 T 390,20" 
                    fill="none" 
                    stroke="var(--olive-light)" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text x="10" y="190" fill="#9ca3af" fontSize="9" fontWeight="700">Month 1</text>
                  <text x="200" y="190" fill="#9ca3af" fontSize="9" fontWeight="700">Month 6</text>
                  <text x="350" y="190" fill="#9ca3af" fontSize="9" fontWeight="700">Month 12</text>
                </svg>
              </div>

              {/* Bar Chart */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block tracking-widest mb-1">RECOMMENDATION SHARE</span>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Percentage of B2B query search answers citing your brand.
                  </p>
                </div>

                <div className="flex justify-around items-end h-[160px] pb-4 mt-8 border-b border-gray-100">
                  <div className="flex flex-col items-center">
                    <div ref={bar1Ref} className="w-8 bg-gray-200 rounded-t-md" style={{ height: '0px' }}></div>
                    <span className="text-xs font-bold text-gray-800 mt-2">12%</span>
                    <span className="text-[9px] text-gray-400 font-medium mt-1">Before Thallo</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div ref={bar2Ref} className="w-8 bg-[#39471D] rounded-t-md" style={{ height: '0px' }}></div>
                    <span className="text-xs font-bold text-[#39471D] mt-2">84%</span>
                    <span className="text-[9px] text-[#39471D] font-bold mt-1">After Thallo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Parallax cards overlays */}
        <div 
          ref={floatCard1Ref}
          className="absolute left-8 bottom-12 bg-white border border-gray-100 p-4 rounded-2xl shadow-lg z-20 flex flex-col gap-1.5"
          style={{ width: '150px' }}
        >
          <span className="text-[18px] font-bold text-[#39471D] leading-none">+420%</span>
          <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Citation Compounding</span>
        </div>

        <div 
          ref={floatCard2Ref}
          className="absolute right-12 top-16 bg-white border border-gray-100 p-4 rounded-2xl shadow-lg z-20 flex flex-col gap-1.5"
          style={{ width: '160px' }}
        >
          <span className="text-[10px] font-bold text-gray-800 leading-none">Ranked #1 in Perplexity</span>
          <span className="text-[8px] text-gray-400 font-medium">Across target categories</span>
        </div>
      </div>
    </section>
  );
}
