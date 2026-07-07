'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INK = '#39471D';

// Organic almond-shaped leaf — base at (0,0), tip at (0,−h)
// wL/wR for subtle asymmetry, feels hand-drawn
function leafD(wL: number, wR: number, h: number): string {
  return [
    `M 0,0`,
    `C ${-wL},${-h * 0.28} ${-wL * 0.65},${-h * 0.72} 0,${-h}`,
    `C ${wR * 0.65},${-h * 0.72} ${wR},${-h * 0.28} 0,0 Z`,
  ].join(' ');
}

// Simple 5-petal Scandinavian flower — all centered at (0,0)
function Petals({ r }: { r: number }) {
  return (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={0}
          cy={-r * 0.9}
          rx={r * 0.3}
          ry={r * 0.46}
          fill={INK}
          transform={`rotate(${a})`}
          style={{ transformBox: 'fill-box' }}
        />
      ))}
      <circle r={r * 0.38} fill={INK} />
    </>
  );
}

// Each leaf: outer <g> holds SVG positioning, inner <g> is GSAP target
const LEAVES: { x: number; y: number; rot: number; wL: number; wR: number; h: number }[] = [
  { x: 110, y: 152, rot: -132, wL: 15, wR: 11, h: 52 },
  { x: 126, y: 238, rot:  -48, wL: 11, wR: 15, h: 36 },
  { x: 130, y: 326, rot: -146, wL: 20, wR: 14, h: 66 },
  { x: 104, y: 418, rot:  -40, wL: 13, wR: 17, h: 44 },
  { x: 102, y: 506, rot: -152, wL: 18, wR: 13, h: 58 },
  { x: 128, y: 604, rot:  -38, wL: 22, wR: 16, h: 72 },
  { x: 112, y: 694, rot: -142, wL: 12, wR:  9, h: 40 },
];

// Stem: single S-curved path — starts above the fold, ends near bottom of section
const STEM =
  'M 118,-30 ' +
  'C 116,48 104,96 110,160 ' +
  'C 116,224 134,266 129,332 ' +
  'C 124,398 100,436 105,504 ' +
  'C 110,572 132,614 126,682 ' +
  'C 120,750 103,794 108,862 ' +
  'C 113,910 111,940 112,960';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stemRef    = useRef<SVGPathElement>(null);
  const leafInners = useRef<(SVGGElement | null)[]>([]);
  const flower1    = useRef<SVGGElement>(null);
  const flower2    = useRef<SVGGElement>(null);
  const step1Ref   = useRef<HTMLDivElement>(null);
  const step2Ref   = useRef<HTMLDivElement>(null);
  const step3Ref   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    if (!stem || !sectionRef.current) return;

    // ── Initial states ──────────────────────────────────────────────
    const len = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });

    leafInners.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0px 0px' });
    });
    [flower1.current, flower2.current].forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0px 0px' });
    });

    // ── Main scrub timeline ──────────────────────────────────────────
    // Total duration = 10 arbitrary units; ScrollTrigger maps to scroll progress.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 8%',
        end: 'bottom 92%',
        scrub: 1.8,
      },
    });

    // Stem draws across the full range
    tl.to(stem, { strokeDashoffset: 0, duration: 10, ease: 'none' }, 0);

    // Leaves appear one by one — each timed so it blooms just after the
    // stem's drawing front reaches its attachment point.
    const leafStarts = [0.9, 1.9, 3.0, 4.0, 5.0, 6.0, 7.0];
    leafInners.current.forEach((el, i) => {
      if (!el) return;
      tl.to(
        el,
        { scale: 1, opacity: 1, duration: 1.3, ease: 'power2.out' },
        leafStarts[i],
      );
    });

    // Flower 1 — mid section
    tl.to(flower1.current, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' }, 7.2);
    // Flower 2 — blooms last, the visual full-stop of the animation
    tl.to(flower2.current, { scale: 1, opacity: 1, duration: 2.0, ease: 'power2.out' }, 8.5);

    // ── Step highlight (separate triggers, not scrubbed) ────────────
    [step1Ref, step2Ref, step3Ref].forEach((ref) => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 75%',
        onEnter:     () => { ref.current?.classList.add('opacity-100'); ref.current?.classList.remove('opacity-40'); },
        onLeaveBack: () => { ref.current?.classList.remove('opacity-100'); ref.current?.classList.add('opacity-40'); },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      className="bg-white border-b border-gray-100 relative overflow-visible"
      style={{ minHeight: '85vh', paddingTop: '6rem', paddingBottom: '6rem' }}
      id="approach"
      ref={sectionRef}
    >
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-16 items-start">

        {/* ── Left: botanical illustration ─────────────────────────── */}
        <div className="relative hidden lg:block" style={{ height: '820px' }}>
          <svg
            viewBox="0 0 240 960"
            className="absolute inset-0 w-full h-full"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            {/* ── Stem ── */}
            <path
              ref={stemRef}
              d={STEM}
              stroke={INK}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* ── Leaves ── */}
            {LEAVES.map((l, i) => (
              <g key={i} transform={`translate(${l.x},${l.y}) rotate(${l.rot})`}>
                {/* Outer g holds position — GSAP must not touch it.
                    Inner g is the scale/opacity animation target. */}
                <g ref={(el) => { leafInners.current[i] = el; }}>
                  <path d={leafD(l.wL, l.wR, l.h)} fill={INK} />
                </g>
              </g>
            ))}

            {/* ── Flower 1 — upper pair of buds ── */}
            <g transform="translate(127,760)">
              <g ref={flower1}>
                <Petals r={10} />
              </g>
            </g>

            {/* ── Flower 2 — terminal bloom, last to appear ── */}
            <g transform="translate(111,878)">
              <g ref={flower2}>
                <Petals r={13} />
              </g>
            </g>
          </svg>
        </div>

        {/* ── Right: steps ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-12 pt-2 lg:pt-8">
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
