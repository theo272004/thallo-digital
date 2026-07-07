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

// Leaf: almond silhouette, base at (0,0), tip at (0,−h)
function leafD(wL: number, wR: number, h: number): string {
  return (
    `M 0,0 C ${-wL},${-h * 0.22} ${-wL * 0.58},${-h * 0.76} 0,${-h} ` +
    `C ${wR * 0.58},${-h * 0.76} ${wR},${-h * 0.22} 0,0 Z`
  );
}

// Botanical flower: rounded teardrop petals around (0,0) + center circle
function BotanicalFlower({ r, n = 5 }: { r: number; n?: number }) {
  const step = 360 / n;
  // Wide teardrop petal — feels hand-drawn not geometric
  const petal =
    `M 0,${r * 0.08} ` +
    `C ${-r * 0.40},-${r * 0.04} ${-r * 0.38},-${r * 0.84} 0,-${r * 1.0} ` +
    `C ${r * 0.38},-${r * 0.84} ${r * 0.40},-${r * 0.04} 0,${r * 0.08} Z`;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={petal}
          fill={INK}
          transform={`rotate(${i * step})`}
        />
      ))}
      <circle r={r * 0.24} fill={INK} />
    </>
  );
}

// ── Stem ──────────────────────────────────────────────────────────────────────
// Organic vine from y=0 (section border) to y=618 (terminal flower).
// Gentle lateral drift — no mechanical S-curves.
const STEM =
  'M 138,0 ' +
  'C 134,28 126,62 118,88 ' +
  'C 110,114 108,138 110,165 ' +
  'C 112,192 108,240 100,285 ' +  // breathing gap — vine flows, no branch
  'C 96,306 98,336 100,365 ' +
  'C 102,394 112,420 116,448 ' +
  'C 116,470 112,492 108,512 ' +
  'C 104,534 108,560 116,586 ' +
  'C 120,600 126,612 130,618';

// ── Secondary branches — subtle cubic-bezier curves ───────────────────────────
// Each starts exactly at a stem segment endpoint for a clean joint.
const BRANCHES = [
  'M 118,88 C 104,82 86,77 68,72',           // 1 · left
  'M 110,165 C 124,160 148,155 168,150',      // 2 · right
  'M 100,285 C 80,278 56,271 30,264',         // 3 · left  (large leaf)
  'M 100,365 C 118,358 148,353 172,348',      // 4 · right
  'M 108,512 C 90,506 72,501 55,496',         // 5 · left
  'M 116,586 C 134,580 160,574 184,568',      // 6 · right (large, lower cluster)
];

// ── Leaves ────────────────────────────────────────────────────────────────────
// x,y = branch endpoint. rot = natural branch direction. wL/wR/h = shape.
// Every leaf is individually rotated to follow its branch — no mirrored copies.
const LEAVES = [
  { x:  68, y:  72, rot: -130, wL: 13, wR: 10, h: 48 }, // 1 small, left
  { x: 168, y: 150, rot:  -44, wL: 15, wR: 20, h: 56 }, // 2 medium, right
  { x:  30, y: 264, rot: -132, wL: 28, wR: 18, h: 86 }, // 3 LARGE, left  ← signature
  { x: 172, y: 348, rot:  -38, wL: 18, wR: 24, h: 66 }, // 4 medium-large, right
  { x:  55, y: 496, rot: -136, wL: 20, wR: 14, h: 60 }, // 5 medium, left
  { x: 184, y: 568, rot:  -42, wL: 22, wR: 28, h: 74 }, // 6 LARGE, right ← lower cluster
];

// ── Flowers ───────────────────────────────────────────────────────────────────
const FLOWERS = [
  { x: 116, y: 448, r: 11, n: 4 }, // mid  · 4-petal, delicate — appears mid-section
  { x: 130, y: 618, r: 17, n: 5 }, // term · 5-petal, generous — blooms with Step 03
];

// ── Animation timeline (0→10 scroll-mapped units) ─────────────────────────────
const ANIM = {
  stem: { at: 0, dur: 10 },
  branches: [
    { at: 0.5, dur: 0.5  }, // 1
    { at: 1.5, dur: 0.5  }, // 2
    { at: 2.8, dur: 0.65 }, // 3 · longer branch
    { at: 4.3, dur: 0.5  }, // 4
    { at: 6.8, dur: 0.5  }, // 5
    { at: 7.6, dur: 0.55 }, // 6 · lower cluster
  ],
  leaves: [
    { at: 0.7, dur: 1.0 }, // 1
    { at: 1.7, dur: 1.1 }, // 2
    { at: 3.1, dur: 1.5 }, // 3 LARGE — unhurried bloom
    { at: 4.6, dur: 1.2 }, // 4
    { at: 7.1, dur: 1.1 }, // 5
    { at: 7.9, dur: 1.3 }, // 6 LARGE
  ],
  flowers: [
    { at: 5.6, dur: 1.4 }, // mid
    { at: 8.8, dur: 1.2 }, // terminal — final moment, synced with Step 03
  ],
};

export default function HowItWorks() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const stemRef      = useRef<SVGPathElement>(null);
  const branchRefs   = useRef<(SVGPathElement | null)[]>([]);
  const leafInners   = useRef<(SVGGElement | null)[]>([]);
  const flowerInners = useRef<(SVGGElement | null)[]>([]);
  const step1Ref     = useRef<HTMLDivElement>(null);
  const step2Ref     = useRef<HTMLDivElement>(null);
  const step3Ref     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    if (!stem || !sectionRef.current) return;

    const stemLen = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: stemLen, strokeDashoffset: stemLen });

    branchRefs.current.forEach((el) => {
      if (!el) return;
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    leafInners.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0 0' });
    });

    flowerInners.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0 0' });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 5%',
        end: 'bottom 95%',
        scrub: 2.2,
      },
    });

    tl.to(stem, { strokeDashoffset: 0, ease: 'none', duration: ANIM.stem.dur }, ANIM.stem.at);

    ANIM.branches.forEach(({ at, dur }, i) => {
      const el = branchRefs.current[i];
      if (el) tl.to(el, { strokeDashoffset: 0, ease: 'none', duration: dur }, at);
    });

    ANIM.leaves.forEach(({ at, dur }, i) => {
      const el = leafInners.current[i];
      if (el) tl.to(el, { scale: 1, opacity: 1, duration: dur, ease: 'power2.out' }, at);
    });

    ANIM.flowers.forEach(({ at, dur }, i) => {
      const el = flowerInners.current[i];
      if (el) tl.to(el, { scale: 1, opacity: 1, duration: dur, ease: 'power2.out' }, at);
    });

    // Step highlights (non-scrubbed, one-way fade-in)
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

        {/* ── Left: botanical — starts flush with the section border ──────── */}
        <div className="relative hidden lg:block" style={{ height: '640px' }}>
          <svg
            viewBox="0 0 280 640"
            className="absolute inset-0 w-full h-full"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            {/* Stem */}
            <path
              ref={stemRef}
              d={STEM}
              stroke={INK}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Secondary branches */}
            {BRANCHES.map((d, i) => (
              <path
                key={i}
                ref={(el) => { branchRefs.current[i] = el; }}
                d={d}
                stroke={INK}
                strokeWidth="1.0"
                strokeLinecap="round"
                fill="none"
              />
            ))}

            {/* Leaves: outer <g> = position+angle, inner <g> = GSAP scale target */}
            {LEAVES.map((l, i) => (
              <g key={i} transform={`translate(${l.x},${l.y}) rotate(${l.rot})`}>
                <g ref={(el) => { leafInners.current[i] = el; }}>
                  <path d={leafD(l.wL, l.wR, l.h)} fill={INK} />
                </g>
              </g>
            ))}

            {/* Flowers */}
            {FLOWERS.map((f, i) => (
              <g key={i} transform={`translate(${f.x},${f.y})`}>
                <g ref={(el) => { flowerInners.current[i] = el; }}>
                  <BotanicalFlower r={f.r} n={f.n} />
                </g>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Right: content — own top padding mirrors removed section padding */}
        <div className="flex flex-col gap-12 lg:pt-[5.5rem]">
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
