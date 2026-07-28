import React from 'react';
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

/* 01 — the audit running down the page, each finding landing as it is checked. */
function ArtAudit() {
  const findings = [
    { label: 'Technical readiness', w: '86%' },
    { label: 'Content coverage', w: '64%' },
    { label: 'Authority signals', w: '74%' },
    { label: 'Schema & markup', w: '52%' },
  ];
  return (
    <Laptop>
      <div className="relative space-y-[9px]">
        {findings.map((f, i) => (
          <div key={f.label} className="step-row flex items-center gap-[6px]" style={{ animationDelay: `${i * 0.26}s` }}>
            {/* the circle fills as the pass reaches it — a finding checked off */}
            <span className="relative h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-[#39471D]">
              <span
                className="step-node absolute inset-[1px] rounded-full bg-[#39471D]"
                style={{ animationDelay: `${0.12 + i * 0.26}s` }}
              />
            </span>
            <span className="h-[4px] rounded-full bg-[#39471D]/75" style={{ width: f.w }} />
          </div>
        ))}
        {/* the pass sweeping down them */}
        <span className="step-scan absolute -inset-x-2.5 top-[-6px] h-[10px] bg-[#39471D]/10" />
      </div>
    </Laptop>
  );
}

/* 02 — the structure being built: a parent, then the pages hung beneath it. */
function ArtFoundation() {
  return (
    <Laptop>
      <div className="step-node flex items-center gap-[6px]">
        <span className="h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[#39471D]" />
        <span className="h-[4px] w-[52px] rounded-full bg-[#39471D]" />
      </div>
      <div className="mt-[9px] ml-[3px] space-y-[8px] border-l border-dashed border-[#CBD0AC] pl-[11px]">
        {['64px', '44px', '54px'].map((w, i) => (
          <div key={w} className="step-node flex items-center gap-[6px]" style={{ animationDelay: `${0.14 + i * 0.13}s` }}>
            <span className="h-[6px] w-[6px] shrink-0 rounded-[2px] bg-[#CBD0AC]" />
            <span className="h-[3.5px] rounded-full bg-[#CBD0AC]" style={{ width: w }} />
          </div>
        ))}
      </div>
    </Laptop>
  );
}

/* 03 — the month's queue working itself off: each piece flips from waiting to
   published, and the bar underneath fills as the month does. The pieces used to
   slide out to the right, which the screen clipped, so nothing read as
   happening. */
function ArtEngine() {
  const queue = [
    { w: '62%', delay: 0 },
    { w: '46%', delay: 0.34 },
    { w: '54%', delay: 0.68 },
  ];
  return (
    <Laptop>
      <div className="flex h-full flex-col">
        <div className="space-y-[11px]">
          {queue.map((q) => (
            <div key={q.w} className="flex items-center gap-[7px]">
              <span
                className="step-fill h-[9px] w-[9px] shrink-0 rounded-[2px] bg-[#39471D]"
                style={{ animationDelay: `${q.delay}s` }}
              />
              <span className="h-[4px] rounded-full bg-[#CBD0AC]" style={{ width: q.w }} />
            </div>
          ))}
        </div>
        <span className="mt-auto block h-[4px] w-full overflow-hidden rounded-full bg-gray-100">
          <span className="step-grow block h-full w-full rounded-full bg-[#39471D]" />
        </span>
      </div>
    </Laptop>
  );
}

/* 04 — the line that keeps climbing once the engine compounds. */
function ArtAccelerate() {
  return (
    <Laptop>
      <svg viewBox="0 0 200 96" className="h-full w-full" preserveAspectRatio="none">
        {[24, 48, 72].map((y) => (
          <path key={y} d={`M2 ${y}h196`} stroke="#E7ECD9" strokeWidth="1.5" />
        ))}
        <path
          d="M6 82 52 66 98 71 144 38 190 14"
          fill="none" stroke="#39471D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="step-draw"
          style={{ strokeDasharray: 210, '--len': 210 } as React.CSSProperties}
          vectorEffect="non-scaling-stroke"
        />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-0 lg:gap-y-0">
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
    </section>
  );
}
