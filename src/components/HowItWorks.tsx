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

// ── Stem ──────────────────────────────────────────────────────────────────────
// Directly adapted from the reference HTML — y-coords scaled 640/1100,
// x-coords kept. Thicker stroke matches reference (2.3).
const STEM =
  'M108 0 ' +
  'C96 41 112 70 98 111 ' +
  'C84 151 120 186 102 230 ' +
  'C82 276 118 314 100 361 ' +
  'C82 407 116 448 98 492 ' +
  'C82 535 108 576 95 628';

// ── Branches ──────────────────────────────────────────────────────────────────
// 6 branches — the 4th leads to the bud flower, not a leaf.
const BRANCHES = [
  'M100 111 C80 105 62 96 45 84',        // 0 → leaf 1 · left
  'M102 183 C128 175 148 163 166 148',   // 1 → leaf 2 · right
  'M98 273 C74 265 56 251 42 235',       // 2 → leaf 3 LARGE · left
  'M103 303 C130 294 147 286 158 273',   // 3 → bud flower · right
  'M96 419 C70 407 52 396 38 378',       // 4 → leaf 4 LARGE · left
  'M98 492 C120 480 142 470 162 460',    // 5 → leaf 5 · right (lower cluster)
];

// ── Leaves ────────────────────────────────────────────────────────────────────
// Organic hand-drawn shapes derived from the reference HTML.
// Each path anchors at (0,0) = branch endpoint; positioned via outer <g> translate.
const LEAVES = [
  {
    x: 45,  y: 84,
    d: 'M0 0 C-20 -18 -24 -52 5 -58 C32 -54 28 -26 0 0',        // small · up-left
  },
  {
    x: 166, y: 148,
    d: 'M0 0 C30 -7 37 25 11 49 C-14 40 -19 13 0 0',              // medium · droops down-right
  },
  {
    x: 42,  y: 235,
    d: 'M0 0 C-28 -22 -30 -68 13 -80 C46 -68 36 -22 0 0',        // LARGE · up
  },
  {
    x: 38,  y: 378,
    d: 'M0 0 C-32 -22 -32 -72 14 -85 C50 -72 40 -25 0 0',        // LARGE · up (lower cluster)
  },
  {
    x: 162, y: 460,
    d: 'M0 0 C26 -10 34 18 12 44 C-14 38 -18 12 0 0',             // medium · droops
  },
];

// ── Bud flower (mid-section) ──────────────────────────────────────────────────
// One curved filled petal + 3 dot stamens — matches reference aesthetic exactly.
const BUD = { x: 158, y: 273 };

// ── Terminal flower (5 petals, each ellipse rotated around its own center) ────
// Matches the reference final flower geometry precisely.
const TERM = { x: 96, y: 605 };

// ── Animation timeline (0→10 scroll-mapped units) ─────────────────────────────
const ANIM = {
  stem:     { at: 0,   dur: 10 },
  branches: [
    { at: 0.5,  dur: 0.5  }, // 0 · leaf 1
    { at: 1.5,  dur: 0.55 }, // 1 · leaf 2
    { at: 2.8,  dur: 0.6  }, // 2 · leaf 3
    { at: 3.5,  dur: 0.5  }, // 3 · bud
    { at: 5.2,  dur: 0.6  }, // 4 · leaf 4
    { at: 7.2,  dur: 0.55 }, // 5 · leaf 5
  ],
  leaves: [
    { at: 0.8,  dur: 1.0 }, // 1
    { at: 1.8,  dur: 1.1 }, // 2
    { at: 3.2,  dur: 1.5 }, // 3 LARGE — slow bloom
    { at: 5.6,  dur: 1.4 }, // 4 LARGE
    { at: 7.5,  dur: 1.2 }, // 5
  ],
  bud:      { at: 4.0, dur: 1.4 }, // blooms after leaf 3
  terminal: { at: 8.8, dur: 1.2 }, // final moment, synced with Step 03 reading
};

export default function HowItWorks() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const stemRef     = useRef<SVGPathElement>(null);
  const branchRefs  = useRef<(SVGPathElement | null)[]>([]);
  const leafInners  = useRef<(SVGGElement | null)[]>([]);
  const budInner    = useRef<SVGGElement>(null);
  const termInner   = useRef<SVGGElement>(null);
  const step1Ref    = useRef<HTMLDivElement>(null);
  const step2Ref    = useRef<HTMLDivElement>(null);
  const step3Ref    = useRef<HTMLDivElement>(null);

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
    if (budInner.current)  gsap.set(budInner.current,  { scale: 0, opacity: 0, transformOrigin: '0 0' });
    if (termInner.current) gsap.set(termInner.current, { scale: 0, opacity: 0, transformOrigin: '0 0' });

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

    const { at: bAt, dur: bDur } = ANIM.bud;
    if (budInner.current)
      tl.to(budInner.current, { scale: 1, opacity: 1, duration: bDur, ease: 'power2.out' }, bAt);

    const { at: tAt, dur: tDur } = ANIM.terminal;
    if (termInner.current)
      tl.to(termInner.current, { scale: 1, opacity: 1, duration: tDur, ease: 'power2.out' }, tAt);

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

        {/* ── Left: botanical, starts flush with the section border ──────── */}
        <div className="relative hidden lg:block" style={{ height: '640px' }}>
          <svg
            viewBox="0 0 220 640"
            className="absolute inset-0 w-full h-full"
            fill="none"
            aria-hidden="true"
            overflow="visible"
            style={{ overflow: 'visible' }}
          >
            {/* Main stem — strokeWidth 2.3 matches reference */}
            <path
              ref={stemRef}
              d={STEM}
              stroke={INK}
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Secondary branches — strokeWidth 1.8 matches reference */}
            {BRANCHES.map((d, i) => (
              <path
                key={i}
                ref={(el) => { branchRefs.current[i] = el; }}
                d={d}
                stroke={INK}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ))}

            {/* Leaves — organic paths, each anchored at branch endpoint */}
            {LEAVES.map((l, i) => (
              <g key={i} transform={`translate(${l.x} ${l.y})`}>
                <g ref={(el) => { leafInners.current[i] = el; }}>
                  <path d={l.d} fill={INK} />
                </g>
              </g>
            ))}

            {/* Mid bud flower: single curved petal + 3 dot stamens */}
            <g transform={`translate(${BUD.x} ${BUD.y})`}>
              <g ref={budInner}>
                <path d="M0 0 C12 -2 18 8 10 18" fill={INK} />
                <circle cx="14" cy="22" r="2.2" fill={INK} />
                <circle cx="20" cy="25" r="2"   fill={INK} />
                <circle cx="9"  cy="27" r="2"   fill={INK} />
              </g>
            </g>

            {/* Terminal flower: 5 ellipses each rotated around their own center */}
            <g transform={`translate(${TERM.x} ${TERM.y})`}>
              <g ref={termInner}>
                <ellipse cx="0"   cy="-18" rx="8" ry="20" fill={INK} />
                <ellipse cx="17"  cy="-5"  rx="8" ry="18" transform="rotate(45 17 -5)"    fill={INK} />
                <ellipse cx="-17" cy="-5"  rx="8" ry="18" transform="rotate(-45 -17 -5)"  fill={INK} />
                <ellipse cx="12"  cy="15"  rx="8" ry="18" transform="rotate(135 12 15)"   fill={INK} />
                <ellipse cx="-12" cy="15"  rx="8" ry="18" transform="rotate(-135 -12 15)" fill={INK} />
                <circle cx="0" cy="0" r="5" fill={INK} />
              </g>
            </g>
          </svg>
        </div>

        {/* ── Right: content with own top padding ───────────────────────── */}
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
