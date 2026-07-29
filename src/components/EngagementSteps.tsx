'use client';

import React, { useEffect, useRef, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

/**
 * "How an engagement runs" — four steps laid along a dotted rule, each with its
 * own small looping drawing. Replaces the full-bleed desk photograph, which
 * said the same thing in one static frame.
 *
 * Each step is drawn inside a laptop built the same way the hero builds its
 * phone and its browser: real chrome in HTML and CSS, animated from globals.css
 * (step-* keyframes). Not images — four more files to download, and a still
 * cannot show a scan running or a structure assembling.
 */

/**
 * The shell every step is drawn inside: a laptop, built the way the hero builds
 * its phone and its browser — real chrome in HTML and CSS rather than an SVG
 * sketch of one. Lid, bezel, a browser bar with its three lights and a URL
 * field, then the deck and its lip below.
 */
function Laptop({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[238px] select-none" aria-hidden="true">
      {/* Lid — the dark bezel wraps the screen */}
      <div className="rounded-[11px] bg-[#1B1B1A] p-[5px] shadow-[0_14px_28px_-16px_rgba(23,26,16,0.55)]">
        <div className="h-[136px] overflow-hidden rounded-[6px] bg-white">
          {/* Browser chrome */}
          <div className="flex items-center gap-[3px] border-b border-gray-100 bg-gray-50 px-2 py-[5px]">
            <span className="h-[4px] w-[4px] rounded-full bg-[#ff5f57]" />
            <span className="h-[4px] w-[4px] rounded-full bg-[#febc2e]" />
            <span className="h-[4px] w-[4px] rounded-full bg-[#28c840]" />
            <span className="ml-[6px] h-[7px] flex-1 rounded-full bg-gray-200/80" />
          </div>
          <div className="relative h-[110px] overflow-hidden px-2.5 py-2.5">{children}</div>
        </div>
      </div>
      {/* Deck — a touch wider than the lid, with the lip that opens it */}
      <div className="-mx-[7%] h-[7px] rounded-b-[8px] bg-gradient-to-b from-[#dededa] to-[#b6b6b1]" />
      <div className="mx-auto h-[3px] w-[15%] rounded-b-[3px] bg-[#a8a8a3]" />
    </div>
  );
}

/* 01 — the audit: a share-of-answer dial swinging round to its reading while
   the findings behind it get checked off. The dial is the one round shape in
   the set — four rectangular drawings in a row read as one drawing repeated. */
function ArtAudit() {
  const R = 19;
  const LEN = 2 * Math.PI * R;         // circumference
  const REST = LEN * (1 - 0.72);       // where the arc stops: 72%

  const findings = [
    { label: 'Technical readiness', w: '52px' },
    { label: 'Content coverage', w: '38px' },
    { label: 'Authority signals', w: '45px' },
  ];

  return (
    <Laptop>
      <div className="relative flex h-full items-center gap-[10px]">
        {/* Dial */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 48 48" className="h-[52px] w-[52px] -rotate-90">
            <circle cx="24" cy="24" r={R} fill="none" stroke="#E7ECD9" strokeWidth="5" />
            <circle
              cx="24" cy="24" r={R}
              fill="none" stroke="#39471D" strokeWidth="5" strokeLinecap="round"
              className="step-sweep"
              style={{ strokeDasharray: LEN, '--len': LEN, '--rest': REST } as React.CSSProperties}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#39471D]">
            72
          </span>
        </div>

        {/* Findings checking off beside it */}
        <div className="relative flex-1 space-y-[9px]">
          {findings.map((f, i) => (
            <div key={f.label} className="step-row flex items-center gap-[6px]" style={{ animationDelay: `${i * 0.24}s` }}>
              <span className="relative h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-[#39471D]">
                <span
                  className="step-node absolute inset-[1px] rounded-full bg-[#39471D]"
                  style={{ animationDelay: `${0.12 + i * 0.24}s` }}
                />
              </span>
              <span className="h-[4px] rounded-full bg-[#39471D]/75" style={{ width: f.w }} />
            </div>
          ))}
          {/* the pass sweeping down them */}
          <span className="step-scan absolute -inset-x-2 top-[-6px] h-[10px] bg-[#39471D]/10" />
        </div>
      </div>
    </Laptop>
  );
}

/* 02 — the structure being built: a parent, then the trunk drawing down and the
   pages hanging themselves off it one after another. */
function ArtFoundation() {
  const children = ['64px', '44px', '54px'];
  return (
    <Laptop>
      <div className="step-node flex items-center gap-[6px]">
        <span className="h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[#39471D]" />
        <span className="h-[4px] w-[52px] rounded-full bg-[#39471D]" />
      </div>
      <div className="relative mt-[9px] ml-[3px] pl-[11px]">
        {/* The trunk draws downward instead of being there from the start —
            it is the thing the pages are hung from, so it has to arrive first. */}
        <span
          aria-hidden="true"
          className="step-drop absolute left-0 top-0 h-full border-l border-dashed border-[#CBD0AC]"
        />
        <div className="space-y-[8px]">
          {children.map((w, i) => (
            <div key={w} className="flex items-center gap-[6px]">
              {/* the branch out to each page, then the page itself */}
              <span
                className="step-grow h-px w-[5px] shrink-0 bg-[#CBD0AC]"
                style={{ animationDelay: `${0.24 + i * 0.16}s` }}
              />
              <span
                className="step-node h-[6px] w-[6px] shrink-0 rounded-[2px] bg-[#CBD0AC]"
                style={{ animationDelay: `${0.3 + i * 0.16}s` }}
              />
              <span
                className="step-node h-[3.5px] rounded-full bg-[#CBD0AC]"
                style={{ width: w, animationDelay: `${0.36 + i * 0.16}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </Laptop>
  );
}

/* 03 — the month's queue working itself off: each piece flips from waiting to
   published, and the bar underneath fills as the month does. The pieces used to
   slide out to the right, which the screen clipped, so nothing read as
   happening. */
function ArtEngine() {
  // Month on month, each taller than the last — the compounding the step
  // describes, and a different shape from the dial and the tree.
  const months = [34, 46, 40, 62, 74, 92];
  return (
    <Laptop>
      <div className="flex h-full flex-col">
        <div className="mb-[7px] flex items-center gap-[6px]">
          <span className="step-fill h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[#39471D]" />
          <span className="h-[3.5px] w-[46px] rounded-full bg-[#CBD0AC]" />
          <span
            className="step-fill h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[#39471D]"
            style={{ animationDelay: '0.4s' }}
          />
          <span className="h-[3.5px] w-[28px] rounded-full bg-[#CBD0AC]" />
        </div>

        <div className="mt-auto flex h-[58px] items-end gap-[6px]">
          {months.map((h, i) => (
            <span
              key={i}
              className="step-rise flex-1 rounded-t-[2px]"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.11}s`,
                backgroundColor: i === months.length - 1 ? '#39471D' : '#CBD0AC',
              }}
            />
          ))}
        </div>
        <span className="mt-[5px] block h-px w-full bg-gray-200" />
      </div>
    </Laptop>
  );
}

/* 04 — the line that keeps climbing once the engine compounds: the area fills
   in behind the stroke, the points land as it passes them, and the endpoint
   throws a halo that keeps pulsing after everything else has settled. */
function ArtAccelerate() {
  const pts = [
    [6, 82], [52, 66], [98, 71], [144, 38], [190, 14],
  ] as const;
  const line = pts.map(([x, y]) => `${x} ${y}`).join(' ');

  return (
    <Laptop>
      <svg viewBox="0 0 200 96" className="h-full w-full" preserveAspectRatio="none">
        {[24, 48, 72].map((y) => (
          <path key={y} d={`M2 ${y}h196`} stroke="#E7ECD9" strokeWidth="1.5" />
        ))}

        {/* Area under the curve, wiped in left to right behind the stroke */}
        <path
          d={`M${line} L190 94 L6 94 Z`}
          fill="#39471D"
          opacity="0.09"
          className="step-wipe"
        />

        <path
          d={`M${line}`}
          fill="none" stroke="#39471D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="step-draw"
          style={{ strokeDasharray: 210, '--len': 210 } as React.CSSProperties}
          vectorEffect="non-scaling-stroke"
        />

        {/* The points the line passes through, landing in turn */}
        {pts.slice(0, -1).map(([x, y], i) => (
          <circle
            key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#39471D" strokeWidth="2"
            className="step-node"
            style={{ animationDelay: `${0.1 + i * 0.22}s` }}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <circle cx="190" cy="14" r="5" fill="#39471D" className="step-halo" />
        <circle cx="190" cy="14" r="5" fill="#39471D" className="step-ping" />
      </svg>
    </Laptop>
  );
}

const STEPS = [
  {
    period: 'Week 1-3',
    title: 'Audit & diagnosis',
    desc: 'We benchmark where you show up across Google and AI, score your share of answer, and hand you a prioritized roadmap.',
    art: <ArtAudit />,
  },
  {
    period: 'Month 1',
    title: 'Foundation',
    desc: 'We rebuild the technical infrastructure so search engines and AI can read, understand, and cite you, plus your first authority piece.',
    art: <ArtFoundation />,
  },
  {
    period: 'Month 2 onward',
    title: 'The Authority Engine',
    desc: 'Original content, distribution, and visibility work, published and compounded every month, with reporting on real outcomes.',
    art: <ArtEngine />,
  },
  {
    period: 'When you are ready',
    title: 'Accelerate',
    desc: 'Flagship projects, proprietary studies, digital PR, and interactive tools that put you on the map for good.',
    art: <ArtAccelerate />,
  },
];

export default function EngagementSteps() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  /* Bumping this remounts the drawings, which is what restarts a CSS animation
     from frame 0. Scroll away and back and you get the build again, not
     whatever the loop happened to be in the middle of. */
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRunning(true);
        setRunKey((k) => k + 1);
      },
      // A third of the block in view: enough that the laptops are on screen,
      // not so much that you have to scroll past them to set it off.
      { threshold: 0.33 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="bg-white py-16 2xl:py-24 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Horizontal padding drops to match what the columns now carry, so the
            outer copy still starts 56px in from the card edge. */}
        <div className="rounded-[32px] border border-gray-100 bg-white p-7 sm:p-10 lg:px-7 lg:py-14">

          <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
            <Eyebrow center className="mb-5">How an engagement runs</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance">
              What working together looks like.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch] mx-auto">
              A clear arc from first look to compounding results — no hidden phases, no surprises.
            </p>
          </div>

          <div className="relative">
            {/* The rule the step pills sit on. The pills are opaque, so it reads
                as broken by them rather than running underneath. */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute left-0 right-0 top-[15px] border-t border-dashed border-[#CBD0AC]"
            />

            {/* The observed element stays mounted; the key that restarts the
                drawings sits on the grid inside it, so remounting never tears
                down the observer that triggered it. */}
            <div ref={gridRef} className={running ? 'steps-run' : undefined}>
            <div key={runKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-0 lg:gap-y-0">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  /* Every column pads on both sides. The outer two used to skip
                     their outside padding, which made them 28px wider — so as
                     the viewport narrowed the middle two hit the laptop's
                     max-width first and shrank alone. */
                  className="group relative flex flex-col lg:px-7"
                >
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gray-200"
                    />
                  )}

                  <div className="relative mb-6 flex">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-[#39471D] border border-[#39471D] text-white transition-colors duration-300 group-hover:bg-[#55672E] group-hover:border-[#55672E]">
                      Step {i + 1}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-[#55672E] mb-2">
                    {s.period}
                  </p>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>

                  {/* mt-auto pins every laptop to the bottom of its column, so
                      the four line up however long the copy above them runs.
                      The grid stretches the columns to equal height, which is
                      what gives the auto margin something to push against. */}
                  <div className="mt-auto pt-7">
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-5">
                      {s.art}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
