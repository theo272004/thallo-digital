'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * The Show Buyers copy, drawn (Cami, 3 November: "un tipo de animación que
 * explique lo que dice ahí", and not a card, because the video above is one).
 *
 * Minimal on purpose. A first version had a ring and an icon for every input
 * and output and a beating heart, and read heavy ("tosca"); this one is hairlines and
 * dots. Left to right it says the same as the paragraphs beside it: many
 * things heard (four grey dots) run into one understanding (the isotipo),
 * which goes out to the right people (three olive dots), who pass it on to
 * one another (the small arcs between them). No words: the copy has them.
 *
 * The lines draw once on the way in; then a short olive dash keeps running
 * along each one and the isotipo turns slowly. With reduced motion it is the
 * finished drawing, still.
 */

const OLIVE = '#39471D';

const IN_Y = [24, 61, 99, 136];
const OUT_Y = [40, 80, 120];
const IN_X = 10;
const CORE = { x: 160, y: 80 };
const OUT_X = 300;

const IN_PATHS = IN_Y.map((y) => `M${IN_X + 4},${y} C${IN_X + 70},${y} ${CORE.x - 70},${CORE.y} ${CORE.x - 24},${CORE.y}`);
const OUT_PATHS = OUT_Y.map((y) => `M${CORE.x + 24},${CORE.y} C${CORE.x + 70},${CORE.y} ${OUT_X - 70},${y} ${OUT_X - 5},${y}`);
const PASS_PATHS = [
  `M${OUT_X + 6},${OUT_Y[0]} C${OUT_X + 26},${OUT_Y[0]} ${OUT_X + 26},${OUT_Y[1]} ${OUT_X + 6},${OUT_Y[1]}`,
  `M${OUT_X + 6},${OUT_Y[1]} C${OUT_X + 26},${OUT_Y[1]} ${OUT_X + 26},${OUT_Y[2]} ${OUT_X + 6},${OUT_Y[2]}`,
];

function Lines({ paths, stage }: { paths: string[]; stage: string }) {
  return (
    <>
      {paths.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#E5E7EB" strokeWidth={1} />
          <path d={d} data-draw={stage} fill="none" stroke={OLIVE} strokeOpacity={0.35} strokeWidth={1} />
          <path d={d} data-flow fill="none" stroke={OLIVE} strokeWidth={1.5} strokeLinecap="round" className="sb-flow" />
        </g>
      ))}
    </>
  );
}

export default function ShowBuyersDiagram({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const draws = (stage: string) => gsap.utils.toArray<SVGPathElement>(`[data-draw="${stage}"]`, svg);
      const flows = gsap.utils.toArray<SVGPathElement>('[data-flow]', svg);

      if (prefersReducedMotion()) {
        gsap.set(flows, { autoAlpha: 0 });
        return;
      }

      [...draws('in'), ...draws('out'), ...draws('pass')].forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(flows, { autoAlpha: 0 });
      gsap.set('[data-node]', { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      tl.to('[data-node="in"]', { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08 })
        .to(draws('in'), { strokeDashoffset: 0, duration: 0.7, stagger: 0.06, ease: 'power1.inOut' }, '-=0.1')
        .to('[data-node="core"]', { autoAlpha: 1, scale: 1, duration: 0.5 }, '-=0.2')
        .to(draws('out'), { strokeDashoffset: 0, duration: 0.7, stagger: 0.06, ease: 'power1.inOut' })
        .to('[data-node="out"]', { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08 }, '-=0.3')
        .to(draws('pass'), { strokeDashoffset: 0, duration: 0.5, stagger: 0.1, ease: 'power1.inOut' })
        .to(flows, { autoAlpha: 1, duration: 0.6 });

      gsap.timeline({
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true, onEnter: () => tl.play() },
      });
    },
    { scope: ref }
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 340 160"
      className={`h-auto w-full overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <Lines paths={IN_PATHS} stage="in" />
      <Lines paths={OUT_PATHS} stage="out" />
      <Lines paths={PASS_PATHS} stage="pass" />

      {IN_Y.map((y) => (
        <circle key={y} data-node="in" cx={IN_X} cy={y} r={3.5} fill="#D1D5DB" />
      ))}

      <g data-node="core">
        <circle cx={CORE.x} cy={CORE.y} r={22} fill="none" stroke={OLIVE} strokeOpacity={0.2} />
        <image href={`${BASE}/flower.webp`} x={CORE.x - 15} y={CORE.y - 15} width={30} height={30} className="sb-spin" />
      </g>

      {OUT_Y.map((y) => (
        <circle key={y} data-node="out" cx={OUT_X} cy={y} r={4.5} fill={OLIVE} />
      ))}
    </svg>
  );
}
