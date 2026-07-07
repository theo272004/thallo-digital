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

  // ── Stroke refs (drawn via strokeDashoffset) ───────────────────────────────
  const stemRef    = useRef<SVGPathElement>(null);
  const bRama1Ref  = useRef<SVGPathElement>(null); // branch → Hoja 1
  const bRama2Ref  = useRef<SVGPathElement>(null); // branch → Hoja 2
  const bRama3Ref  = useRef<SVGPathElement>(null); // branch → Flor 3
  const bRama4Ref  = useRef<SVGPathElement>(null); // branch → Hoja 4

  // ── Fill refs (scaled in, grow from element center) ────────────────────────
  const hoja1Ref      = useRef<SVGGElement>(null);
  const hoja2Ref      = useRef<SVGGElement>(null);
  const flor3Ref      = useRef<SVGGElement>(null);
  const hoja4Ref      = useRef<SVGGElement>(null);
  const hoja5Ref      = useRef<SVGGElement>(null);
  const florFinRef    = useRef<SVGGElement>(null);

  // ── Step highlight refs ────────────────────────────────────────────────────
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !stemRef.current) return;

    // Init stroke paths
    [stemRef, bRama1Ref, bRama2Ref, bRama3Ref, bRama4Ref].forEach((r) => {
      const el = r.current;
      if (!el) return;
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    // Init fill elements — scale from their own visual center
    [hoja1Ref, hoja2Ref, flor3Ref, hoja4Ref, hoja5Ref, florFinRef].forEach((r) => {
      if (r.current) gsap.set(r.current, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    });

    // ── Main scrubbed timeline ─────────────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 5%',
        end: 'bottom 95%',
        scrub: 2.2,
      },
    });

    // Stem draws continuously from 0→10
    tl.to(stemRef.current, { strokeDashoffset: 0, ease: 'none', duration: 10 }, 0);

    // Hoja 1 — stem's first branch, top-right (~17% into vine)
    tl.to(bRama1Ref.current,  { strokeDashoffset: 0, ease: 'none',    duration: 0.5 }, 1.4);
    tl.to(hoja1Ref.current,   { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.1 }, 1.6);

    // Hoja 2 — left leaf, upper-middle (~32% into vine)
    tl.to(bRama2Ref.current,  { strokeDashoffset: 0, ease: 'none',    duration: 0.5 }, 2.8);
    tl.to(hoja2Ref.current,   { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.2 }, 3.0);

    // Flor 3 — small flower cluster, right-middle (~43%)
    tl.to(bRama3Ref.current,  { strokeDashoffset: 0, ease: 'none',    duration: 0.5 }, 3.8);
    tl.to(flor3Ref.current,   { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.2 }, 4.0);

    // Hoja 4 — right leaf, lower-middle (~59%)
    tl.to(bRama4Ref.current,  { strokeDashoffset: 0, ease: 'none',    duration: 0.5 }, 5.4);
    tl.to(hoja4Ref.current,   { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.3 }, 5.7);

    // Hoja 5 — left leaf, lower (~74%) — attaches directly to stem, no branch
    tl.to(hoja5Ref.current,   { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.3 }, 7.0);

    // Flor ultima — terminal flower (~91%), blooms as Step 03 is finished
    tl.to(florFinRef.current, { scale: 1, opacity: 1, ease: 'power2.out', duration: 1.2 }, 8.8);

    // ── Step highlights (non-scrubbed, one-way) ────────────────────────────
    [step1Ref, step2Ref, step3Ref].forEach((ref) => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 78%',
        onEnter:     () => { ref.current?.classList.add('opacity-100');    ref.current?.classList.remove('opacity-40'); },
        onLeaveBack: () => { ref.current?.classList.remove('opacity-100'); ref.current?.classList.add('opacity-40'); },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      className="bg-white border-b border-gray-100 pt-[5.5rem] lg:pt-0 pb-[5.5rem]"
      id="approach"
      ref={sectionRef}
    >
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-16 items-start">

        {/* ── Left: Illustrator SVG, flush with the section border ──────────── */}
        <div className="relative hidden lg:block" style={{ height: '860px' }}>
          <svg
            viewBox="0 0 205.56 764.83"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {/* ── Rama: main stem + 4 branches (stroke, drawn by GSAP) ─────── */}
            <path
              ref={stemRef}
              d="M74.39.27c-8.42,46.33-6.81,86.54,2.17,125.7,5.2,22.69,12.87,45.02,22.49,67.99,11.48,27.4,21.16,56.21,26.98,85.35,9.76,48.81-2.9,99.26-19.4,146.23-16.5,46.96-37.71,79.51-41.62,131.95-3.7,49.64,12.1,118.92,35.02,149.58"
              fill="none" stroke="#3c4a25" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama1Ref}
              d="M76.56,125.97s9.48,11.6,34.08,11.01"
              fill="none" stroke="#3c4a25" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama2Ref}
              d="M89.52,254.75s14.74-32.61,13.7-51.13"
              fill="none" stroke="#3c4a25" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama3Ref}
              d="M127.32,286.21s11.35,26.8,40.11,47.74"
              fill="none" stroke="#3c4a25" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama4Ref}
              d="M109.9,415.15s2.93,29.64,7.92,38.84"
              fill="none" stroke="#3c4a25" strokeMiterlimit="10" strokeWidth="3"
            />

            {/* ── Hoja 1 — top right ───────────────────────────────────────── */}
            <g ref={hoja1Ref}>
              <path
                d="M122.55,146.42c24.25,16.32,43.4,10.61,69.27-.86-.95-4.58-4.43-5.55-7.14-7.81-7.13-5.94-13.43-12.75-21.95-16.7-14.57-6.75-30.05-2.32-42.87,6.71-5.86,4.85-12.64,7.23-19.25,7.24,3.36,1.72,6.71,3.54,10.07,5.61,3.82,1.27,7.73,3.03,11.88,5.82Z"
                fill="#3f4b26"
              />
            </g>

            {/* ── Hoja 2 — left, upper-middle ──────────────────────────────── */}
            <g ref={hoja2Ref}>
              <path
                d="M92.08,245.41c-6.88,9.51-16.51,15.92-27.74,19.54-27.9,9-41.83,30.25-52.64,58.76,36.22,6.55,64.9-9.73,76.33-44.81l5.83-28.52c.13-.64.28-1.28.42-1.92-.12-2.48-.01-4.9-.39-7.12-.57,1.36-1.16,2.72-1.81,4.07Z"
                fill="#3f4b26"
              />
            </g>

            {/* ── Flor 3 — small flower cluster, right-middle ──────────────── */}
            <g ref={flor3Ref}>
              <path
                d="M204.92,335.83c-4.69-7.65-19.6-7.52-27.32-6.44-5.96.83-11.1.62-15.73-1.9-1.99-.48-3.95-1.07-5.9-1.72,4.03,3.82,7.68,8.7,6.85,14.57-1.88,13.3-2.68,29.05,4.52,30.68,4.93,1.12,8.61-5.35,8.66-14.86,2.45,2.91,5,5.42,7.27,7.18,1.8,1.39,6.85.3,8.35-1.86,4-5.78.77-10.77-3.18-16.8,6.49,2.52,20.21-2.75,16.48-8.84Z"
                fill="#3f4b26"
              />
            </g>

            {/* ── Hoja 4 — right, lower-middle ─────────────────────────────── */}
            <g ref={hoja4Ref}>
              <path
                d="M112.81,460.49c-2.36,36.82,17.35,59.21,53.61,67.03,3.75-31.9-6.62-54.23-33.97-68.65-8.64-4.55-14.17-11.13-17.17-18.84-1.14,2.67-1.8,5.47-2.19,8.33.11,3.95-.02,7.99-.28,12.13Z"
                fill="#3f4b26"
              />
            </g>

            {/* ── Hoja 5 — left, lower ─────────────────────────────────────── */}
            <g ref={hoja5Ref}>
              <path
                d="M62.87,559.11c-.02.17-.05.35-.08.52-1.46,10.26-15.31,15.51-23.35,18.29-28.36,9.81-41.19,31.76-39.25,61.66,25.63-2.28,47.55-18.3,54.61-42.8l7.39-25.62.02.27c1.13-4.1,1.08-8.21.65-12.31Z"
                fill="#3f4b26"
              />
            </g>

            {/* ── Flor ultima — terminal flower, bottom ────────────────────── */}
            <g ref={florFinRef}>
              <path
                d="M94.99,701.83c1.06,6.27-.84,14.33,2.68,20.89-14.13,11.85-21.69,32.65-12.66,36.6,6.25,2.73,9.21-5.1,14.42-9.52,1.11,8.79,3.26,15.17,9.28,15.03,6.3-.16,6.79-8.29,7.55-18.28,6.58,6.7,13.53,12.33,18.45,8.5,5.71-4.44,1.86-15.78-7.91-24.39,7.58,1.82,14.52,3.34,20.04-1.53,2.13-1.88,1.84-5.55.45-7.73-4.77-7.45-21.48-9.31-35.02-5.96-2.92-6.04-9.61-9.73-14.2-13.87-.04-.07-.07-.15-.11-.22-1.14-.09-2.28-.23-3.42-.45.16.32.31.64.46.95Z"
                fill="#3f4b26"
              />
            </g>
          </svg>
        </div>

        {/* ── Right: content — gap-20 fills the ~860px left column height ───── */}
        <div className="flex flex-col gap-20 lg:pt-[5.5rem]">
          <div>
            <Eyebrow className="mb-5">Our Method</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
              html="How we build AI visibility."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch]">
              A systematic B2B authority building process that converts search
              queries into revenue-generating recommendations.
            </p>
          </div>

          <div ref={step1Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1 flex-shrink-0">STEP 01</div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Audit & Visibility Mapping</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We audit your search presence across ChatGPT, Perplexity, and
                Google AI Overview. We compile a prioritized action plan.
              </p>
            </div>
          </div>

          <div ref={step2Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1 flex-shrink-0">STEP 02</div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Authority Infrastructure</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We construct the content assets, research databases, and
                technical schemas required for AI crawlers to catalog your brand.
              </p>
            </div>
          </div>

          <div ref={step3Ref} className="opacity-40 transition-opacity duration-500 flex gap-6 items-start">
            <div className="text-[11px] font-mono font-bold text-gray-400 mt-1 flex-shrink-0">STEP 03</div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Expert Distribution & Seed</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We seed your insights across authority nodes. Conversational
                models synthesize these nodes, citation by citation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
