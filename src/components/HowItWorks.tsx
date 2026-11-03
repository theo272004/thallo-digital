'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal, scrollToEl } from '@/components/motion';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * One step beside the branch. `chips` are the deliverable pills the archived
 * home shows; `link` is the text link the 1 November home shows instead. A
 * link to an in-page anchor (`#...`) scrolls rather than jumps.
 */
export type HowItWorksStep = {
  title: string;
  body: string;
  chips?: string[];
  link?: { label: string; href: string };
};

/* Four steps, always: the branch has four side-shoots and each circle is timed
   to one of them. */
const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    title: 'Diagnose',
    body: 'Measure where you appear, what the models say, and who wins the questions that matter.',
    chips: ['Visibility baseline', 'Competitor citation gap', 'Question map'],
  },
  {
    title: 'Build the work',
    body: 'Produce original evidence nobody else could run: studies, data, definitive guides.',
    chips: ['Data studies', 'Research reports', 'Whitepapers', 'Definitive guides'],
  },
  {
    title: 'Make it readable',
    body: 'Make your site readable for AI and built so authority compounds over time.',
    chips: ['Technical SEO', 'Pillar pages', 'Generative Engine Optimization'],
  },
  {
    title: 'Carry it out',
    body: 'Place the work where buyers and models find it: press, podcasts, the 20 sites that count.',
    chips: ['LinkedIn', 'Communities', 'Podcasts', 'Newsletters'],
  },
];

/* Cami's copy of 3 October. The engine is named in the paragraph now; the
   heading says what it is made of. */
const DEFAULT_HEADING =
  'Good research. Useful content. <span class="italic text-[#39471D]">A connected operation.</span>';
const DEFAULT_INTRO =
  'Our Authority Engine brings research, content, technical SEO and distribution into one ongoing service. We run the work from diagnosis through publishing and promotion, then track what changes in your visibility.';

/* When each circle appears on the scrubbed timeline: the moment its leaf
   blooms on the branch. */
const CIRCLE_AT = [2.2, 4.05, 4.65, 6.28];

export default function HowItWorks({
  heading = DEFAULT_HEADING,
  intro = DEFAULT_INTRO,
  steps = DEFAULT_STEPS,
  id = 'approach',
  compact = false,
}: {
  heading?: string;
  /** Left out entirely when null: the 1 November home has no paragraph here. */
  intro?: string | null;
  steps?: HowItWorksStep[];
  id?: string;
  /** Tighter rhythm for the 1 November home's four longer steps: on a desktop
   *  the archive's gaps spread them out and stretched the branch beside them
   *  (Cami, 2 November: "menos espacio"). The archive keeps its own. */
  compact?: boolean;
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // ── Stroke refs (drawn via strokeDashoffset) ───────────────────────────────
  const stemRef    = useRef<SVGPathElement>(null);
  const bRama1Ref  = useRef<SVGPathElement>(null);
  const bRama2Ref  = useRef<SVGPathElement>(null);
  const bRama3Ref  = useRef<SVGPathElement>(null);
  const bRama4Ref  = useRef<SVGPathElement>(null);

  // ── Fill refs (scaled in, grow from element center) ────────────────────────
  const hoja1Ref      = useRef<SVGGElement>(null);
  const hoja2Ref      = useRef<SVGGElement>(null);
  const flor3Ref      = useRef<SVGGElement>(null);
  const hoja4Ref      = useRef<SVGGElement>(null);
  const hoja5Ref      = useRef<SVGGElement>(null);
  const florFinRef    = useRef<SVGGElement>(null);

  // ── Step highlight + circle refs, one per step ─────────────────────────────
  const stepRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef    = useRef<HTMLDivElement>(null);
  const branchRef  = useRef<HTMLDivElement>(null);

  /* Compact: the branch box ends exactly at the 04 circle, so the last
     bloom sits level with it (Cami, 3 November: "que termine donde dice 04,
     literal"). Measured, because the steps' height changes with the screen.
     The circle is scaled to zero until it blooms; its centre is unaffected. */
  useEffect(() => {
    if (!compact) return;
    const box = branchRef.current;
    const lastCircle = circleRefs.current[circleRefs.current.length - 1];
    if (!box || !lastCircle) return;
    const fit = () => {
      const top = box.getBoundingClientRect().top;
      const c = lastCircle.getBoundingClientRect();
      const bottom = c.top + c.height / 2 + 16; // the circle's lower edge
      box.style.height = `${Math.max(bottom - top, 320)}px`;
      ScrollTrigger.refresh();
    };
    fit();
    /* Again once the fonts settle and whenever the steps reflow. */
    const refit = () => requestAnimationFrame(fit);
    document.fonts?.ready.then(refit);
    const ro = new ResizeObserver(refit);
    ro.observe(lastCircle.parentElement?.parentElement ?? box);
    window.addEventListener('resize', refit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', refit);
    };
  }, [compact]);

  useEffect(() => {
    if (!sectionRef.current || !stemRef.current) return;

    const circles = circleRefs.current;
    const first = circles[0];
    const last = circles[circles.length - 1];

    // Measure first→last circle centers and set line height precisely so it stops at the last one
    if (first && last && lineRef.current) {
      const c1 = first.getBoundingClientRect();
      const c4 = last.getBoundingClientRect();
      const parent = lineRef.current.parentElement!.getBoundingClientRect();
      const topOffset  = (c1.top - parent.top) + c1.height / 2;
      const lineHeight = (c4.top + c4.height / 2) - (c1.top + c1.height / 2);
      gsap.set(lineRef.current, { top: topOffset, height: lineHeight, bottom: 'auto' });
    }

    // Init stroke paths
    [stemRef, bRama1Ref, bRama2Ref, bRama3Ref, bRama4Ref].forEach((r) => {
      const el = r.current;
      if (!el) return;
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    // Init fill elements
    const blooms = [
      { ref: hoja1Ref,   origin: '0% 45%' },
      { ref: hoja2Ref,   origin: '99% 0%' },
      { ref: flor3Ref,   origin: '0% 0%'  },
      { ref: hoja4Ref,   origin: '4% 1%'  },
      { ref: hoja5Ref,   origin: '100% 7%' },
      { ref: florFinRef, origin: '22% 0%' },
    ];
    blooms.forEach(({ ref, origin }) => {
      if (ref.current) gsap.set(ref.current, { scale: 0, opacity: 0, transformOrigin: origin });
    });

    // ── Main scrubbed timeline ─────────────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 90%',
        scrub: 1,
      },
    });

    tl.to(stemRef.current, { strokeDashoffset: 0, ease: 'none', duration: 10 }, 0);

    tl.to(bRama1Ref.current, { strokeDashoffset: 0, ease: 'none',        duration: 0.45 }, 1.9);
    tl.to(hoja1Ref.current,  { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.9  }, 2.2);

    tl.to(bRama2Ref.current, { strokeDashoffset: 0, ease: 'none',        duration: 0.45 }, 3.75);
    tl.to(hoja2Ref.current,  { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.9  }, 4.05);

    tl.to(bRama3Ref.current, { strokeDashoffset: 0, ease: 'none',           duration: 0.45 }, 4.35);
    tl.to(flor3Ref.current,  { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.9  }, 4.65);

    tl.to(bRama4Ref.current, { strokeDashoffset: 0, ease: 'none',        duration: 0.45 }, 5.98);
    tl.to(hoja4Ref.current,  { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.9  }, 6.28);

    tl.to(hoja5Ref.current,  { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.9 }, 8.0);

    tl.to(florFinRef.current, { scale: 1, opacity: 1, ease: 'power3.out', duration: 1.2 }, 10);

    // ── Circle indicators — synced with plant blooms ───────────────────────
    // Line grows from circle 1 appearance through circle 4 appearance
    tl.to(lineRef.current,    { scaleY: 1, ease: 'none', duration: 4.08 }, 2.2);
    circles.forEach((c, i) => {
      if (c) tl.to(c, { scale: 1, opacity: 1, ease: 'power3.out', duration: 0.6 }, CIRCLE_AT[i] ?? CIRCLE_AT[CIRCLE_AT.length - 1]);
    });

    // ── Step highlights (non-scrubbed, one-way) ────────────────────────────
    stepRefs.current.forEach((el) => {
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 78%',
        onEnter:     () => { el.classList.add('opacity-100');    el.classList.remove('opacity-40'); },
        onLeaveBack: () => { el.classList.remove('opacity-100'); el.classList.add('opacity-40'); },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      /* White ground. The grey moved one section down, to the scanner stripe —
         the ground belongs to the slot rather than to the component, so if this
         ever moves in the page order the colour stays with the slot and not
         with the approach. */
      className="bg-white border-b border-gray-100 pt-[5.5rem] lg:pt-0 pb-[5.5rem]"
      id={id}
      ref={sectionRef}
    >
      <div className="max-w-[90rem] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-16 items-start">

        {/* ── Left: Illustrator SVG, flush with the section border ──────────── */}
        <div
          ref={branchRef}
          className={`relative hidden lg:block ${
            /* Compact: its height is set from the 04 circle (see the effect
               above); this is only the size before that runs. */
            compact ? 'h-[45rem]' : 'h-[53.75rem] 2xl:h-[62.5rem]'
          }`}
        >
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
              fill="none" stroke="#39471D" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama1Ref}
              d="M76.56,125.97s9.48,11.6,34.08,11.01"
              fill="none" stroke="#39471D" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama2Ref}
              d="M89.52,254.75s14.74-32.61,13.7-51.13"
              fill="none" stroke="#39471D" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama3Ref}
              d="M127.32,286.21s11.35,26.8,40.11,47.74"
              fill="none" stroke="#39471D" strokeMiterlimit="10" strokeWidth="3"
            />
            <path
              ref={bRama4Ref}
              d="M109.9,415.15s2.93,29.64,7.92,38.84"
              fill="none" stroke="#39471D" strokeMiterlimit="10" strokeWidth="3"
            />

            {/* ── Hoja 1 — top right ───────────────────────────────────────── */}
            <g ref={hoja1Ref}>
              <path
                d="M122.55,146.42c24.25,16.32,43.4,10.61,69.27-.86-.95-4.58-4.43-5.55-7.14-7.81-7.13-5.94-13.43-12.75-21.95-16.7-14.57-6.75-30.05-2.32-42.87,6.71-5.86,4.85-12.64,7.23-19.25,7.24,3.36,1.72,6.71,3.54,10.07,5.61,3.82,1.27,7.73,3.03,11.88,5.82Z"
                fill="#39471D"
              />
            </g>

            {/* ── Hoja 2 — left, upper-middle ──────────────────────────────── */}
            <g ref={hoja2Ref}>
              <path
                d="M92.08,245.41c-6.88,9.51-16.51,15.92-27.74,19.54-27.9,9-41.83,30.25-52.64,58.76,36.22,6.55,64.9-9.73,76.33-44.81l5.83-28.52c.13-.64.28-1.28.42-1.92-.12-2.48-.01-4.9-.39-7.12-.57,1.36-1.16,2.72-1.81,4.07Z"
                fill="#39471D"
              />
            </g>

            {/* ── Flor 3 — small flower cluster, right-middle ──────────────── */}
            <g ref={flor3Ref}>
              <path
                d="M204.92,335.83c-4.69-7.65-19.6-7.52-27.32-6.44-5.96.83-11.1.62-15.73-1.9-1.99-.48-3.95-1.07-5.9-1.72,4.03,3.82,7.68,8.7,6.85,14.57-1.88,13.3-2.68,29.05,4.52,30.68,4.93,1.12,8.61-5.35,8.66-14.86,2.45,2.91,5,5.42,7.27,7.18,1.8,1.39,6.85.3,8.35-1.86,4-5.78.77-10.77-3.18-16.8,6.49,2.52,20.21-2.75,16.48-8.84Z"
                fill="#39471D"
              />
            </g>

            {/* ── Hoja 4 — right, lower-middle ─────────────────────────────── */}
            <g ref={hoja4Ref}>
              <path
                d="M112.81,460.49c-2.36,36.82,17.35,59.21,53.61,67.03,3.75-31.9-6.62-54.23-33.97-68.65-8.64-4.55-14.17-11.13-17.17-18.84-1.14,2.67-1.8,5.47-2.19,8.33.11,3.95-.02,7.99-.28,12.13Z"
                fill="#39471D"
              />
            </g>

            {/* ── Hoja 5 — left, lower ─────────────────────────────────────── */}
            <g ref={hoja5Ref}>
              <path
                d="M62.87,559.11c-.02.17-.05.35-.08.52-1.46,10.26-15.31,15.51-23.35,18.29-28.36,9.81-41.19,31.76-39.25,61.66,25.63-2.28,47.55-18.3,54.61-42.8l7.39-25.62.02.27c1.13-4.1,1.08-8.21.65-12.31Z"
                fill="#39471D"
              />
            </g>

            {/* ── Flor ultima — terminal flower, bottom ────────────────────── */}
            <g ref={florFinRef}>
              <path
                d="M94.99,701.83c1.06,6.27-.84,14.33,2.68,20.89-14.13,11.85-21.69,32.65-12.66,36.6,6.25,2.73,9.21-5.1,14.42-9.52,1.11,8.79,3.26,15.17,9.28,15.03,6.3-.16,6.79-8.29,7.55-18.28,6.58,6.7,13.53,12.33,18.45,8.5,5.71-4.44,1.86-15.78-7.91-24.39,7.58,1.82,14.52,3.34,20.04-1.53,2.13-1.88,1.84-5.55.45-7.73-4.77-7.45-21.48-9.31-35.02-5.96-2.92-6.04-9.61-9.73-14.2-13.87-.04-.07-.07-.15-.11-.22-1.14-.09-2.28-.23-3.42-.45.16.32.31.64.46.95Z"
                fill="#39471D"
              />
            </g>
          </svg>
        </div>

        {/* ── Right: content ────────────────────────────────────────────────── */}
        {/* The drawn branch is desktop-only, so on phones this column is the whole
            section — left-aligned copy hugging one edge read as a leftover of a
            two-column layout that isn't there. Centred, it stands on its own. */}
        <div
          className={`flex flex-col ${
            compact ? 'gap-10 2xl:gap-12' : 'gap-14 2xl:gap-20'
          } lg:pt-[5.5rem] text-center lg:text-left`}
        >
          <div>
            <SplitReveal
              as="h2"
              className={`text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans ${intro ? 'mb-6' : ''}`}
              html={heading}
            />
            {intro && (
              <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch] mx-auto lg:mx-0">
                {intro}
              </p>
            )}
          </div>

          {/* Steps with circle indicators + connecting line */}
          <div className={`relative flex flex-col ${compact ? 'gap-8 2xl:gap-10' : 'gap-14 2xl:gap-20'}`}>

            {/* Vertical line — height set by useEffect to exactly span circle 1→4 centers */}
            <div
              ref={lineRef}
              className="absolute w-px bg-[#E6E6E1] pointer-events-none hidden lg:block"
              style={{
                left: '16px',
                top: '16px',
                transform: 'scaleY(0)',
                transformOrigin: 'top',
              }}
            />

            {steps.map((step, i) => (
              <div
                key={step.title}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="opacity-40 transition-opacity duration-500 flex gap-6 items-start justify-center lg:justify-start"
              >
                <div
                  ref={(el) => { circleRefs.current[i] = el; }}
                  className="w-[2rem] h-[2rem] rounded-full flex items-center justify-center flex-shrink-0 hidden lg:flex"
                  style={{ backgroundColor: '#39471D', transform: 'scale(0)', opacity: 0 }}
                >
                  <span className="text-xs font-semibold text-white">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed">{step.body}</p>
                  {/* What the phase hands over. Named deliverables rather than
                      adjectives: a phase you cannot point at the output of is a
                      phase nobody can tell you finished.

                      The hover edge is the industry cards' own (`#55672E` at
                      40%, over 300ms) so the two read as the same gesture. Only
                      the border moves: those cards also lift and cast a shadow,
                      and a 26px pill doing that reads as a button promising
                      something it does not do. */}
                  {step.chips && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5 justify-center lg:justify-start">
                      {step.chips.map((chip) => (
                        <span
                          key={chip}
                          className="text-xs font-medium text-gray-800 bg-white border border-gray-200 rounded-full px-3 py-1 lift-sm transition-all duration-300 hover:text-[#39471D]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.link && (
                    <a
                      href={step.link.href}
                      onClick={(e) => {
                        if (!step.link?.href.startsWith('#')) return;
                        e.preventDefault();
                        scrollToEl(step.link.href);
                      }}
                      /* A pill, the same shape as the deliverable chips this
                         slot held before: border at rest, olive fill on hover. */
                      className="group mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-[0_2px_8px_-4px_rgba(23,26,16,0.12)] transition-all duration-300 hover:border-[#39471D] hover:bg-[#39471D] hover:text-white"
                    >
                      {step.link.label}
                      <ArrowUpRight className="text-xs text-gray-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </a>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
