import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

/**
 * "How an engagement runs" — four steps laid along a dotted rule, each with its
 * own small looping drawing. Replaces the full-bleed desk photograph, which
 * said the same thing in one static frame.
 *
 * The drawings are inline SVG animated from globals.css (step-* keyframes)
 * rather than images: four more files to download, and a photograph can't show
 * a scan running or a structure assembling.
 */

/* Every drawing shares the same monitor frame, so the four read as one set. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 104" className="w-full h-auto" role="img" aria-hidden="true">
      <rect x="16" y="8" width="128" height="74" rx="7" fill="#FFFFFF" stroke="#C9D2B4" strokeWidth="1.5" />
      {children}
      <path d="M80 82v10M62 92h36" stroke="#C9D2B4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* 01 — a scan sweeping the page, findings lighting up behind it. */
function ArtAudit() {
  const rows = [
    { y: 26, w: 84 },
    { y: 40, w: 62 },
    { y: 54, w: 76 },
    { y: 68, w: 48 },
  ];
  return (
    <Screen>
      {rows.map((r, i) => (
        <rect
          key={r.y}
          x="30" y={r.y} width={r.w} height="5" rx="2.5"
          fill="#39471D"
          className="step-row"
          style={{ animationDelay: `${i * 0.28}s` }}
        />
      ))}
      <rect
        x="24" y="20" width="112" height="2.5" rx="1.25"
        fill="#39471D" opacity="0.35"
        className="step-scan"
      />
    </Screen>
  );
}

/* 02 — the structure drawing itself, then the pages landing under it. */
function ArtFoundation() {
  return (
    <Screen>
      <rect x="66" y="18" width="28" height="12" rx="3" fill="#E7ECD9" stroke="#39471D" strokeWidth="1.5" />
      <path
        d="M80 30v14M44 44h72M44 44v10M80 44v10M116 44v10"
        fill="none" stroke="#39471D" strokeWidth="1.5" strokeLinecap="round"
        className="step-draw"
        style={{ strokeDasharray: 116, '--len': 116 } as React.CSSProperties}
      />
      {[32, 68, 104].map((x, i) => (
        <rect
          key={x}
          x={x} y="54" width="24" height="12" rx="3"
          fill="#FFFFFF" stroke="#C9D2B4" strokeWidth="1.5"
          className="step-node"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </Screen>
  );
}

/* 03 — work leaving the page, month after month. */
function ArtEngine() {
  return (
    <Screen>
      {[{ y: 26, w: 44 }, { y: 40, w: 34 }, { y: 54, w: 40 }].map((l) => (
        <rect key={l.y} x="28" y={l.y} width={l.w} height="4" rx="2" fill="#C9D2B4" />
      ))}
      {[24, 40, 56].map((y, i) => (
        <rect
          key={y}
          x="82" y={y} width="18" height="10" rx="5"
          fill="#E7ECD9" stroke="#39471D" strokeWidth="1.5"
          className="step-chip"
          style={{ animationDelay: `${i * 0.34}s` }}
        />
      ))}
    </Screen>
  );
}

/* 04 — the line that keeps climbing once the engine compounds. */
function ArtAccelerate() {
  return (
    <Screen>
      <path d="M28 70h104" stroke="#E2E6D8" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M30 64 52 56 74 58 96 42 118 28"
        fill="none" stroke="#39471D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="step-draw"
        style={{ strokeDasharray: 100, '--len': 100 } as React.CSSProperties}
      />
      <circle cx="118" cy="28" r="4.5" fill="#39471D" className="step-ping" />
    </Screen>
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
        <div className="rounded-[32px] border border-gray-100 bg-white p-7 sm:p-10 lg:p-14">

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
              className="hidden lg:block absolute left-0 right-0 top-[15px] border-t border-dashed border-[#D5DAC6]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-0 lg:gap-y-0">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="group relative flex flex-col lg:px-7 lg:first:pl-0 lg:last:pr-0"
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

                  <div className="mt-7 rounded-2xl border border-gray-100 bg-white px-4 py-5">
                    {s.art}
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
