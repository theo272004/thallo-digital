'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * The Show Buyers copy, as motion (Cami, 3 November: "un tipo de animación
 * que explique lo que dice ahí", not a card, because the video above is one).
 *
 * Two earlier drawings joined nodes with lines — first with icons, then with
 * hairlines — and both read as a flowchart ("no me gusta que sea línea, como
 * que conecta"). This one has no lines between things. It is a field of
 * orbits around the isotipo, and it plays the paragraphs as one loop:
 *
 *   1. Listening: grey points drift in from outside and are absorbed by the
 *      isotipo (interviews, research, sales materials, search data).
 *   2. Understanding: the isotipo swells once.
 *   3. Reach: a ripple goes out from it, and each point on the orbits turns
 *      olive as it passes (the right people, remembering, passing it on).
 *
 * The orbits turn very slowly the whole time. With reduced motion it is the
 * last frame, still: the isotipo and the olive points.
 */

const OLIVE = '#39471D';
const GREY = '#D1D5DB';
const C = 120; // centre of the 240×240 box
const CORE_R = 24;
const RIPPLE_TO = 116;

const ORBITS = [52, 80, 106];
/* The points that light up: [orbit radius, angle in degrees]. */
const PEOPLE: [number, number][] = [
  [52, -30], [52, 150],
  [80, 20], [80, 110], [80, 215], [80, 300],
  [106, -70], [106, 60], [106, 170], [106, 250],
];
/* Where the incoming points start, outside the last orbit. */
const SIGNALS = [200, 25, 290, 120, 335];

const at = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
};

export default function ShowBuyersDiagram({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const people = gsap.utils.toArray<SVGCircleElement>('[data-person]', svg);
      const signals = gsap.utils.toArray<SVGCircleElement>('[data-signal]', svg);

      if (prefersReducedMotion()) {
        gsap.set(people, { attr: { fill: OLIVE } });
        gsap.set(signals, { autoAlpha: 0 });
        return;
      }

      gsap.to('[data-orbits]', { rotation: 360, svgOrigin: `${C} ${C}`, duration: 90, ease: 'none', repeat: -1 });

      const RIPPLE_DUR = 1.8;
      const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });

      // 1. Listening: the signals drift in and vanish into the centre.
      loop.fromTo(
        signals,
        { attr: { cx: (i: number) => at(140, SIGNALS[i]).x, cy: (i: number) => at(140, SIGNALS[i]).y }, autoAlpha: 0 },
        { attr: { cx: C, cy: C }, autoAlpha: 1, duration: 1.4, ease: 'power2.in', stagger: 0.18 }
      );
      loop.to(signals, { autoAlpha: 0, duration: 0.2, stagger: 0.18 }, '<1.2');

      // 2. Understanding: the isotipo swells once.
      loop.to('[data-core]', { scale: 1.12, svgOrigin: `${C} ${C}`, duration: 0.35, ease: 'power2.out' });
      loop.to('[data-core]', { scale: 1, svgOrigin: `${C} ${C}`, duration: 0.5, ease: 'power2.inOut' });

      // 3. Reach: a ripple, and every point it passes turns olive.
      const rippleAt = loop.duration() - 0.4;
      loop.fromTo(
        '[data-ripple]',
        { attr: { r: CORE_R }, autoAlpha: 0.55 },
        { attr: { r: RIPPLE_TO }, autoAlpha: 0, duration: RIPPLE_DUR, ease: 'power1.out' },
        rippleAt
      );
      people.forEach((p) => {
        const r = Number(p.dataset.r);
        const t = rippleAt + ((r - CORE_R) / (RIPPLE_TO - CORE_R)) * RIPPLE_DUR * 0.75;
        loop.to(p, { attr: { fill: OLIVE, r: 4.5 }, duration: 0.35, ease: 'power2.out' }, t);
      });

      // Rest a moment lit, then fade back to grey for the next pass.
      loop.to(people, { attr: { fill: GREY, r: 3.5 }, duration: 0.8, ease: 'power1.inOut' }, '+=1.4');

      gsap.timeline({
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true, onEnter: () => loop.play() },
      });
    },
    { scope: ref }
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 240"
      className={`h-auto w-full overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g data-orbits>
        {ORBITS.map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="#E5E7EB" strokeWidth={0.75} />
        ))}
        {PEOPLE.map(([r, deg]) => {
          const p = at(r, deg);
          return <circle key={`${r}-${deg}`} data-person data-r={r} cx={p.x} cy={p.y} r={3.5} fill={GREY} />;
        })}
      </g>

      <circle data-ripple cx={C} cy={C} r={CORE_R} fill="none" stroke={OLIVE} strokeWidth={1} opacity={0} />

      {SIGNALS.map((deg) => (
        <circle key={deg} data-signal cx={C} cy={C} r={2.5} fill="#9CA3AF" opacity={0} />
      ))}

      <g data-core>
        <circle cx={C} cy={C} r={CORE_R} fill={OLIVE} fillOpacity={0.08} />
        <image href={`${BASE}/flower.webp`} x={C - 15} y={C - 15} width={30} height={30} className="sb-spin" />
      </g>
    </svg>
  );
}
