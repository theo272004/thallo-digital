'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TheProblem() {
  const num1Ref = useRef<HTMLDivElement>(null);
  const num2Ref = useRef<HTMLDivElement>(null);
  const num3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [
      { ref: num1Ref, val: 45, suffix: '%' },
      { ref: num2Ref, val: 69, suffix: '%' },
      { ref: num3Ref, val: 1, suffix: '' }
    ];

    targets.forEach((item) => {
      if (item.ref.current) {
        let obj = { value: 0 };
        gsap.to(obj, {
          value: item.val,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item.ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          },
          onUpdate: () => {
            if (item.ref.current) {
              item.ref.current.innerText = Math.round(obj.value) + item.suffix;
            }
          }
        });
      }
    });
  }, []);

  return (
    <section className="bg-white py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="shift">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow className="mb-5">The Shift</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
            html="Buying now starts with a question typed into a machine."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[50ch]">
            The brand it names first is the one that wins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl">
            <div className="text-4xl sm:text-5xl font-serif text-[#39471D] mb-4 font-bold" ref={num1Ref}>0%</div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-gray-900 mb-2">B2B AI evaluation</p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">of B2B buyers used AI during a recent purchase to evaluate vendors.</p>
          </div>
          
          <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl">
            <div className="text-4xl sm:text-5xl font-serif text-[#39471D] mb-4 font-bold" ref={num2Ref}>0%</div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-gray-900 mb-2">Zero-Click Searches</p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">of searches now end without a single click to a website.</p>
          </div>
          
          <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl">
            <div className="text-4xl sm:text-5xl font-serif text-[#39471D] mb-4 font-bold" ref={num3Ref}>0</div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-gray-900 mb-2">Primary recommendation</p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">answer. AI gives one recommendation, not a page of ten links.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
