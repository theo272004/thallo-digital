'use client';

import React, { useRef } from 'react';
import { FileText, Heart, LayoutTemplate, Mic, PenLine, Search, Send, UserRound, Users } from 'lucide-react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * The Show Buyers copy, drawn (Cami, 3 November: "un tipo de animación que
 * explique lo que dice ahí", and not a card, because the video above is one).
 *
 * No words: the paragraphs beside it already say everything, so the drawing
 * only retells them in four stages, left to right.
 *
 *   1. What we listen to — expert interviews, customer research, sales
 *      materials, search data (mic, people, document, magnifier).
 *   2. What it becomes — the understanding, shown as the isotipo they all
 *      run into.
 *   3. What we plan from it — the site's structure, the content, its
 *      distribution (layout, pen, send).
 *   4. Who it reaches — the right people, who then pass the name on to one
 *      another (the heart on the arcs between them).
 *
 * On the way in the lines draw stage by stage and each node arrives as its
 * line reaches it. After that it keeps moving gently: olive dashes run along
 * every line, the isotipo turns, and the heart beats. With reduced motion it
 * is simply the finished drawing.
 */

const OLIVE = '#39471D';

const SOURCES = [
  { y: 52, Icon: Mic },
  { y: 124, Icon: Users },
  { y: 196, Icon: FileText },
  { y: 268, Icon: Search },
];
const PLAN = [
  { y: 88, Icon: LayoutTemplate },
  { y: 160, Icon: PenLine },
  { y: 232, Icon: Send },
];
const PEOPLE_Y = [88, 160, 232];

const SRC_X = 48;
const CORE = { x: 238, y: 160, r: 44 };
const PLAN_X = 428;
const PEOPLE_X = 596;
const NODE_R = 24;

/* Every connecting line, by stage. */
const IN_PATHS = SOURCES.map(
  ({ y }) => `M${SRC_X + NODE_R},${y} C${SRC_X + 110},${y} ${CORE.x - 100},${CORE.y} ${CORE.x - CORE.r},${CORE.y}`
);
const OUT_PATHS = PLAN.map(
  ({ y }) => `M${CORE.x + CORE.r},${CORE.y} C${CORE.x + 100},${CORE.y} ${PLAN_X - 90},${y} ${PLAN_X - NODE_R},${y}`
);
const REACH_PATHS = PLAN.map(({ y }) => `M${PLAN_X + NODE_R},${y} L${PEOPLE_X - NODE_R},${y}`);
/* People recommending each other: arcs on the far side of the column. */
const PASS_PATHS = [
  `M${PEOPLE_X + NODE_R},${PEOPLE_Y[0]} C${PEOPLE_X + 62},${PEOPLE_Y[0]} ${PEOPLE_X + 62},${PEOPLE_Y[1]} ${PEOPLE_X + NODE_R},${PEOPLE_Y[1]}`,
  `M${PEOPLE_X + NODE_R},${PEOPLE_Y[1]} C${PEOPLE_X + 62},${PEOPLE_Y[1]} ${PEOPLE_X + 62},${PEOPLE_Y[2]} ${PEOPLE_X + NODE_R},${PEOPLE_Y[2]}`,
];

function Node({ x, y, Icon }: { x: number; y: number; Icon: typeof Mic }) {
  return (
    <g>
      <circle cx={x} cy={y} r={NODE_R} fill="#fff" stroke="#E5E7EB" strokeWidth={1.25} />
      <Icon x={x - 10} y={y - 10} width={20} height={20} color={OLIVE} strokeWidth={1.75} />
    </g>
  );
}

function Lines({ paths, stage }: { paths: string[]; stage: string }) {
  return (
    <>
      {paths.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#E5E7EB" strokeWidth={1.5} />
          <path d={d} data-draw={stage} fill="none" stroke={OLIVE} strokeWidth={1.75} strokeLinecap="round" />
          <path d={d} data-flow fill="none" stroke={OLIVE} strokeWidth={2.25} strokeLinecap="round" className="sb-flow" />
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

      [...draws('in'), ...draws('out'), ...draws('reach'), ...draws('pass')].forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(flows, { autoAlpha: 0 });
      gsap.set('[data-node]', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });
      tl.to('[data-node="src"]', { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.12 })
        .to(draws('in'), { strokeDashoffset: 0, duration: 0.8, stagger: 0.08, ease: 'power1.inOut' }, '-=0.1')
        .to('[data-node="core"]', { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.25')
        .to(draws('out'), { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: 'power1.inOut' })
        .to('[data-node="plan"]', { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.1 }, '-=0.35')
        .to(draws('reach'), { strokeDashoffset: 0, duration: 0.6, stagger: 0.08, ease: 'power1.inOut' })
        .to('[data-node="person"]', { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.1 }, '-=0.3')
        .to(draws('pass'), { strokeDashoffset: 0, duration: 0.6, stagger: 0.15, ease: 'power1.inOut' })
        .to('[data-node="heart"]', { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2')
        .to(flows, { autoAlpha: 0.9, duration: 0.6 });

      gsap.timeline({
        scrollTrigger: { trigger: svg, start: 'top 80%', once: true, onEnter: () => tl.play() },
      });
    },
    { scope: ref }
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 680 320"
      className={`h-auto w-full overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <Lines paths={IN_PATHS} stage="in" />
      <Lines paths={OUT_PATHS} stage="out" />
      <Lines paths={REACH_PATHS} stage="reach" />
      <Lines paths={PASS_PATHS} stage="pass" />

      {SOURCES.map(({ y, Icon }) => (
        <g key={y} data-node="src">
          <Node x={SRC_X} y={y} Icon={Icon} />
        </g>
      ))}

      {/* The understanding: the isotipo every source runs into. */}
      <g data-node="core">
        <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 10} fill={OLIVE} opacity={0.08} />
        <circle cx={CORE.x} cy={CORE.y} r={CORE.r} fill="#fff" stroke={OLIVE} strokeWidth={1.5} />
        <image
          href={`${BASE}/flower.webp`}
          x={CORE.x - 30}
          y={CORE.y - 30}
          width={60}
          height={60}
          className="sb-spin"
        />
      </g>

      {PLAN.map(({ y, Icon }) => (
        <g key={y} data-node="plan">
          <Node x={PLAN_X} y={y} Icon={Icon} />
        </g>
      ))}

      {PEOPLE_Y.map((y) => (
        <g key={y} data-node="person">
          <circle cx={PEOPLE_X} cy={y} r={NODE_R} fill={OLIVE} />
          <UserRound x={PEOPLE_X - 10} y={y - 10} width={20} height={20} color="#fff" strokeWidth={1.75} />
        </g>
      ))}

      {/* Passing the name on. */}
      <g data-node="heart">
        <g className="sb-beat">
          <circle cx={PEOPLE_X + 54} cy={PEOPLE_Y[1]} r={14} fill="#fff" stroke={OLIVE} strokeWidth={1.25} />
          <Heart x={PEOPLE_X + 47} y={PEOPLE_Y[1] - 7} width={14} height={14} color={OLIVE} fill={OLIVE} strokeWidth={1.5} />
        </g>
      </g>
    </svg>
  );
}
