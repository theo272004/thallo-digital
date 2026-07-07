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

// Almond-shaped leaf: base at (0,0), tip at (0,−h), slight asymmetry
function leafD(wL: number, wR: number, h: number): string {
  return (
    `M 0,0 C ${-wL},${-h * 0.24} ${-wL * 0.6},${-h * 0.74} 0,${-h} ` +
    `C ${wR * 0.6},${-h * 0.74} ${wR},${-h * 0.24} 0,0 Z`
  );
}

// Minimal botanical flower: n oval petals arranged around origin + solid center
function Petals({ r, n = 5 }: { r: number; n?: number }) {
  const step = 360 / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-r * 0.78}
          rx={r * 0.26}
          ry={r * 0.44}
          fill={INK}
          transform={`rotate(${i * step})`}
        />
      ))}
      <circle r={r * 0.3} fill={INK} />
    </>
  );
}

// ── Stem ──────────────────────────────────────────────────────────────────────
// One long organic vine — subtle drift, not repetitive S-curves.
// Starts at y=0 (top border), terminates at terminal flower (y=800).
const STEM =
  'M 115,0 ' +
  'C 113,42 104,88 98,152 ' +
  'C 92,216 84,234 82,262 ' +
  'C 80,290 72,308 70,328 ' +
  'C 68,348 76,368 90,392 ' +
  'C 104,416 126,428 130,460 ' +
  'C 134,492 118,510 110,528 ' +
  'C 102,546 86,560 82,582 ' +
  'C 78,604 78,622 82,644 ' +
  'C 86,666 118,682 126,706 ' +
  'C 134,730 122,756 115,780';

// ── Secondary branches — short organic paths from stem to leaf attachment ─────
const BRANCHES = [
  'M 98,152 C 86,150 74,148 62,145',           // 1 · left
  'M 82,252 C 94,248 108,244 120,240',          // 2 · right
  'M 70,318 C 57,314 42,310 28,305',            // 3 · left  (large leaf)
  'M 93,398 C 106,394 120,390 136,385',         // 4 · right
  'M 110,524 C 97,520 83,516 70,512',           // 5 · left
  'M 83,579 C 96,575 111,570 126,565',          // 6 · right
  'M 126,706 C 137,702 150,697 162,692',        // 7 · right (small leaf)
];

// ── Leaf definitions ──────────────────────────────────────────────────────────
// x,y = branch endpoint (leaf attachment). rot = rotation. wL/wR/h = shape.
const LEAVES = [
  { x:  62, y: 145, rot: -150, wL: 10, wR:  8, h: 40 }, // 1 narrow
  { x: 120, y: 240, rot:  -36, wL: 12, wR: 16, h: 44 }, // 2 medium
  { x:  28, y: 305, rot: -146, wL: 22, wR: 15, h: 70 }, // 3 LARGE
  { x: 136, y: 385, rot:  -34, wL: 14, wR: 18, h: 52 }, // 4 medium
  { x:  70, y: 512, rot: -150, wL: 17, wR: 12, h: 56 }, // 5 medium
  { x: 126, y: 565, rot:  -40, wL: 12, wR: 15, h: 42 }, // 6 small
  { x: 162, y: 692, rot:  -28, wL:  8, wR: 11, h: 30 }, // 7 tiny
];

// ── Flowers ───────────────────────────────────────────────────────────────────
const FLOWERS = [
  { x:  82, y: 642, r:  8, n: 4 },  // mid · 4-petal small bloom
  { x: 115, y: 780, r: 13, n: 5 },  // terminal · 5-petal, final full-stop
];

// ── Timeline positions (0–10 units → scroll progress) ────────────────────────
// Terminal flower (index 1) blooms at 8.2–9.8 so it lands while Step 03 is read
const ANIM = {
  stem:     { at: 0,   dur: 10 },
  branches: [
    { at: 0.5, dur: 0.55 },
    { at: 1.4, dur: 0.55 },
    { at: 2.5, dur: 0.60 },
    { at: 3.7, dur: 0.55 },
    { at: 5.0, dur: 0.55 },
    { at: 5.8, dur: 0.55 },
    { at: 7.2, dur: 0.55 },
  ],
  leaves: [
    { at: 0.7, dur: 1.1 },
    { at: 1.6, dur: 1.1 },
    { at: 2.7, dur: 1.4 },  // large leaf, slower
    { at: 4.0, dur: 1.1 },
    { at: 5.2, dur: 1.2 },
    { at: 6.0, dur: 1.0 },
    { at: 7.5, dur: 0.9 },
  ],
  flowers: [
    { at: 6.4, dur: 1.4 },  // mid bloom
    { at: 8.2, dur: 1.8 },  // TERMINAL — synced with Step 03 becoming active
  ],
};

export default function HowItWorks() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const stemRef     = useRef<SVGPathElement>(null);
  const branchRefs  = useRef<(SVGPathElement | null)[]>([]);
  const leafInners  = useRef<(SVGGElement | null)[]>([]);
  const flowerInners = useRef<(SVGGElement | null)[]>([]);
  const step1Ref    = useRef<HTMLDivElement>(null);
  const step2Ref    = useRef<HTMLDivElement>(null);
  const step3Ref    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    if (!stem || !sectionRef.current) return;

    // Stem
    const stemLen = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: stemLen, strokeDashoffset: stemLen });

    // Branches
    branchRefs.current.forEach((el) => {
      if (!el) return;
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    // Leaves — scale from attachment point (local 0,0)
    leafInners.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0 0' });
    });

    // Flowers — scale from center
    flowerInners.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 0, transformOrigin: '0 0' });
    });

    // Main scrubbed timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 6%',
        end: 'bottom 94%',
        scrub: 2.0,
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

    // Step highlights (separate, non-scrubbed triggers)
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
      className="bg-white border-b border-gray-100"
      style={{ paddingTop: '5.5rem', paddingBottom: '5.5rem' }}
      id="approach"
      ref={sectionRef}
    >
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-16 items-start">

        {/* ── Left: botanical illustration ─────────────────────────────── */}
        <div className="relative hidden lg:block" style={{ height: '820px' }}>
          <svg
            viewBox="0 0 240 820"
            className="absolute inset-0 w-full h-full"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            {/* Main stem */}
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

            {/* Leaves — outer <g> positions, inner <g> is GSAP target */}
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
                  <Petals r={f.r} n={f.n} />
                </g>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Right: steps ──────────────────────────────────────────────── */}
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
