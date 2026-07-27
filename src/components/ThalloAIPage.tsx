'use client';

import React from 'react';

/* ── Design tokens ──────────────────────────────────────────────────────────
   Swiss editorial: warm off-white ground, a single hairline weight, two olives
   and one high-voltage accent used rarely enough that it still reads as an
   accent. No gradient, no glow, no dark mode, no skeuomorphism.            */
const C = {
  bg:       '#FBFCF7',
  line:     '#ECE9E2',
  olive:    '#39471D',
  oliveMid: '#445A20',
  lime:     '#DFFF3B',
  ink:      '#1B1D17',
  muted:    '#767B6C',
  ghost:    '#A8ADA0',
} as const;

const CARD = 'bg-white rounded-[28px] border';
const SHADOW = { boxShadow: '0 24px 60px -32px rgba(27,29,23,0.16)' };

function Mono({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${className}`} style={style}>
      {children}
    </span>
  );
}

/* ── Stage content ──────────────────────────────────────────────────────── */
const ANALYZE = [
  'AI Recommendations (ChatGPT, Gemini, Perplexity)',
  'Brand Mentions & Citations',
  'Google AI Overview Presence',
  'Authority & Trust Signals',
  'Technical Readiness',
  'Priority Action Plan',
];

const SCAN = [
  { name: 'ChatGPT',                 pct: 72, state: 'Scanning…' },
  { name: 'Gemini',                  pct: 54, state: 'Scanning…' },
  { name: 'Perplexity',              pct: 31, state: 'Scanning…' },
  { name: 'Google AI Overview',      pct: 0,  state: 'Waiting…'  },
  { name: 'Website & Technical SEO', pct: 0,  state: 'Waiting…'  },
];

const PRESENCE = [
  { name: 'ChatGPT',            sub: 'Found in 3 of 5 answers',     tag: 'Mentioned',     tone: 'on'  },
  { name: 'Gemini',             sub: 'Found in 4 of 5 answers',     tag: 'Mentioned',     tone: 'on'  },
  { name: 'Perplexity',         sub: 'Found in 0 of 5 answers',     tag: 'Not mentioned', tone: 'off' },
  { name: 'Google AI Overview', sub: 'Appears in related overview', tag: 'Partial',       tone: 'mid' },
];

const TILES = [
  { n: '15', l: 'Questions analyzed' },
  { n: '4',  l: 'AI mentions' },
  { n: '2',  l: 'Platforms mentioned' },
  { n: '11', l: 'Opportunities found' },
];

const BREAKDOWN = [
  { name: 'ChatGPT',            pct: 60, note: '3 / 5 answers' },
  { name: 'Gemini',             pct: 80, note: '4 / 5 answers' },
  { name: 'Perplexity',         pct: 0,  note: '0 / 5 answers' },
  { name: 'Google AI Overview', pct: 40, note: 'Partial presence' },
];

const ACTIONS = [
  { t: 'Create authoritative comparison content',    d: 'Build in-depth comparison pages for key solutions in your category.',       impact: 4, p: 'High'   },
  { t: 'Earn mentions from trusted websites',        d: 'Acquire backlinks and brand mentions from high-authority sites.',           impact: 3, p: 'High'   },
  { t: 'Optimize for AI-friendly content structure', d: 'Use clear headings, summaries and structured data for better AI parsing.',  impact: 3, p: 'Medium' },
];

/* ── Primitives ─────────────────────────────────────────────────────────── */
function Stage({ n, label, blurb, children }: { n: string; label: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[186px_1fr] gap-8 lg:gap-14">
      {/* Left rail — the spine that makes six screens read as one journey */}
      <div className="relative lg:pt-1">
        <span
          aria-hidden="true"
          className="hidden lg:block absolute -left-[36px] top-[13px] w-[7px] h-[7px] rounded-full"
          style={{ background: C.olive }}
        />
        <p className="font-serif text-[32px] leading-none mb-3" style={{ color: C.ink }}>{n}</p>
        <Mono className="block mb-4" style={{ color: C.oliveMid }}>{label}</Mono>
        <p className="text-sm font-medium leading-relaxed max-w-[24ch]" style={{ color: C.muted }}>{blurb}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Bar({ pct, h = 4 }: { pct: number; h?: number }) {
  return (
    <span className="block w-full rounded-full overflow-hidden" style={{ background: C.line, height: h }}>
      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: C.olive }} />
    </span>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: string }) {
  const s =
    tone === 'on'  ? { background: C.olive, color: '#fff' }
  : tone === 'mid' ? { background: C.lime, color: C.olive }
  :                  { background: '#fff', color: C.muted, border: `1px solid ${C.line}` };
  return (
    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0" style={s}>
      {children}
    </span>
  );
}

const Glyph = ({ d, s = 11 }: { d: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.oliveMid} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function ThalloAIPage() {
  const R = 52;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="pt-32 pb-24" style={{ background: C.bg }}>
      <div className="max-w-[1180px] mx-auto px-6">

        {/* ── Masthead ───────────────────────────────────────────────────── */}
        <header className="max-w-[64ch] mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-7" style={{ background: C.oliveMid }} />
            <Mono style={{ color: C.oliveMid }}>Thallo AI Visibility Engine</Mono>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl leading-[1.03] mb-6" style={{ color: C.ink }}>
            See how AI answers<br />describe you — end to end.
          </h1>
          <p className="text-base font-medium leading-relaxed mb-7 max-w-[58ch]" style={{ color: C.muted }}>
            Six stages, from the question you type to the plan you act on. Below is the full
            journey of a Thallo visibility audit, shown exactly as it runs.
          </p>
          <span className="inline-flex items-center gap-2.5 rounded-full px-4 py-2" style={{ border: `1px solid ${C.line}`, background: '#fff' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.lime }} />
            <Mono style={{ color: C.muted }}>Sample report · illustrative figures</Mono>
          </span>
        </header>

        {/* ── The journey ────────────────────────────────────────────────── */}
        <div className="relative flex flex-col gap-16 lg:gap-24 lg:pl-[52px]">
          <span aria-hidden="true" className="hidden lg:block absolute left-0 top-3 bottom-3 w-px" style={{ background: C.line }} />

          {/* ── 01 · Audit setup ───────────────────────────────────────── */}
          <Stage n="01" label="Audit setup" blurb="Tell us about your brand and target category.">
            <div className={CARD} style={{ borderColor: C.line, ...SHADOW }}>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 sm:p-10 md:border-r" style={{ borderColor: C.line }}>
                  <Mono className="block mb-7" style={{ color: C.muted }}>Audit parameters</Mono>
                  {[
                    ['Brand name', 'e.g. Ledgerly', false],
                    ['Industry / target query', 'Fintech', true],
                    ['Website URL (optional)', 'e.g. https://ledgerly.co', false],
                  ].map(([l, p, filled]) => (
                    <div key={l as string} className="mb-5">
                      <Mono className="block mb-2" style={{ color: C.muted }}>{l as string}</Mono>
                      <div
                        className="rounded-2xl px-4 py-3.5 text-sm font-medium flex items-center justify-between"
                        style={{ border: `1px solid ${C.line}`, color: filled ? C.ink : C.ghost }}
                      >
                        {p as string}
                        {filled ? <span style={{ color: C.muted }}>⌄</span> : null}
                      </div>
                    </div>
                  ))}
                  <div className="mt-7 rounded-full py-3.5 text-center text-sm font-semibold text-white" style={{ background: C.olive }}>
                    Start AI Visibility Audit
                  </div>
                  <div className="mt-5 rounded-2xl p-4 flex gap-3" style={{ background: C.bg }}>
                    <span className="mt-0.5 shrink-0"><Glyph d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" s={14} /></span>
                    <p className="text-[11px] font-medium leading-relaxed" style={{ color: C.muted }}>
                      No signup required · Results in under 30 seconds.<br />
                      Powered by ChatGPT, Gemini &amp; Perplexity.
                    </p>
                  </div>
                </div>

                <div className="p-8 sm:p-10 relative overflow-hidden">
                  <Mono className="block mb-7" style={{ color: C.muted }}>What we will analyze</Mono>
                  <ul className="flex flex-col gap-4 relative z-10">
                    {ANALYZE.map((a) => (
                      <li key={a} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-px bg-white" style={{ border: `1px solid ${C.line}` }}>
                          <Glyph d="M20 6 9 17l-5-5" />
                        </span>
                        <span className="text-sm font-medium leading-snug" style={{ color: C.ink }}>{a}</span>
                      </li>
                    ))}
                  </ul>
                  <img
                    src="/thallo-digital/isotipo.png" alt="" aria-hidden="true" loading="lazy" decoding="async"
                    width={512} height={512}
                    className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.06] rotate-[14deg] pointer-events-none select-none"
                  />
                </div>
              </div>
            </div>
          </Stage>

          {/* ── 02 · Scanning ──────────────────────────────────────────── */}
          <Stage n="02" label="Scanning" blurb="Agents read how each platform answers for your category.">
            <div className={`${CARD} p-8 sm:p-10`} style={{ borderColor: C.line, ...SHADOW }}>
              <h2 className="font-serif text-3xl mb-8" style={{ color: C.ink }}>Scanning your visibility…</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_264px] gap-8 lg:gap-12">
                <div className="flex flex-col gap-5">
                  {SCAN.map((s) => (
                    <div key={s.name} className="flex items-center gap-4">
                      <span className="w-7 h-7 rounded-lg shrink-0" style={{ border: `1px solid ${C.line}`, background: C.bg }} />
                      {/* 184px so "Website & Technical SEO" sits on one line */}
                      <span className="text-sm font-semibold w-[184px] shrink-0" style={{ color: C.ink }}>{s.name}</span>
                      <span className="flex-1 min-w-0"><Bar pct={s.pct} /></span>
                      <Mono className="w-[64px] shrink-0 text-right" style={{ color: C.muted }}>{s.state}</Mono>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] p-6" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                  <Mono className="block mb-4" style={{ color: C.muted }}>Live progress</Mono>
                  <p className="font-serif text-5xl leading-none mb-1" style={{ color: C.ink }}>
                    2 <span className="text-2xl" style={{ color: C.muted }}>/ 5</span>
                  </p>
                  <p className="text-sm font-medium mb-5" style={{ color: C.muted }}>Platforms scanned</p>
                  <Bar pct={40} h={5} />
                  <p className="mt-6 pt-5 text-[11px] font-medium leading-relaxed" style={{ borderTop: `1px solid ${C.line}`, color: C.muted }}>
                    This usually takes 20–30 seconds.
                  </p>
                </div>
              </div>
            </div>
          </Stage>

          {/* ── 03 · Results overview ──────────────────────────────────── */}
          <Stage n="03" label="Results overview" blurb="How the brand performs across AI platforms.">
            <div className="flex flex-col gap-5">
              <div className={CARD} style={{ borderColor: C.line, ...SHADOW }}>
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="p-8 sm:p-10 lg:border-r" style={{ borderColor: C.line }}>
                    <Mono className="block mb-7" style={{ color: C.muted }}>AI visibility score</Mono>
                    <div className="relative w-[186px] h-[186px] mx-auto">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r={R} fill="none" stroke={C.line} strokeWidth="11" />
                        <circle cx="60" cy="60" r={R} fill="none" stroke={C.olive} strokeWidth="11" strokeLinecap="round"
                          strokeDasharray={`${CIRC * 0.27} ${CIRC}`} />
                        {/* Short lime tail — the headroom, the only place the accent appears here */}
                        <circle cx="60" cy="60" r={R} fill="none" stroke={C.lime} strokeWidth="11" strokeLinecap="round"
                          strokeDasharray={`${CIRC * 0.08} ${CIRC}`} strokeDashoffset={`${-CIRC * 0.29}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-serif text-[46px] leading-none" style={{ color: C.ink }}>27%</span>
                        <span className="mt-2 text-[11px] font-medium text-center leading-tight" style={{ color: C.muted }}>
                          Your visibility<br />score
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 sm:p-10 lg:border-r" style={{ borderColor: C.line }}>
                    <Mono className="block mb-5" style={{ color: C.muted }}>AI platform presence</Mono>
                    <div className="flex flex-col gap-3">
                      {PRESENCE.map((p) => (
                        <div key={p.name} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ border: `1px solid ${C.line}` }}>
                          <span className="w-7 h-7 rounded-lg shrink-0" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-bold truncate" style={{ color: C.ink }}>{p.name}</span>
                            <span className="block text-[11px] font-medium truncate" style={{ color: C.muted }}>{p.sub}</span>
                          </span>
                          <Tag tone={p.tone}>{p.tag}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitors stay redacted — this is a sample, and naming
                      real rivals in one would be a claim we cannot stand behind. */}
                  <div className="p-8 sm:p-10">
                    <Mono className="block mb-5" style={{ color: C.muted }}>Recommended instead of you</Mono>
                    <div className="flex flex-col gap-3">
                      {[8, 7, 6, 6].map((n, i) => (
                        <div key={i} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: C.bg }}>
                          <Mono style={{ color: C.muted }}>{String(i + 1).padStart(2, '0')}</Mono>
                          <span className="min-w-0 flex-1">
                            <span className="block h-2.5 rounded-full mb-1.5" style={{ background: C.line, width: `${64 - i * 6}%` }} />
                            <span className="block text-[11px] font-medium" style={{ color: C.muted }}>Mentioned in {n} answers</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {TILES.map((t) => (
                  <div key={t.l} className={`${CARD} px-7 py-6`} style={{ borderColor: C.line }}>
                    <p className="font-serif text-[38px] leading-none mb-3" style={{ color: C.ink }}>{t.n}</p>
                    <Mono style={{ color: C.muted }}>{t.l}</Mono>
                  </div>
                ))}
              </div>
            </div>
          </Stage>

          {/* ── 04 · Detailed report ───────────────────────────────────── */}
          <Stage n="04" label="Detailed report" blurb="Deeper insight across every category we score.">
            <div className={CARD} style={{ borderColor: C.line, ...SHADOW }}>
              <div className="px-8 sm:px-10 pt-7 flex flex-wrap items-center gap-x-8 gap-y-3 justify-between" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {['AI visibility', 'Authority', 'Content', 'Technical', 'Comparisons'].map((t, i) => (
                    <span key={t} className="pb-4 -mb-px" style={i === 0 ? { borderBottom: `2px solid ${C.olive}` } : undefined}>
                      <Mono style={{ color: i === 0 ? C.ink : C.muted }}>{t}</Mono>
                    </span>
                  ))}
                </div>
                <span className="mb-4 rounded-full px-4 py-2 flex items-center gap-2 bg-white" style={{ border: `1px solid ${C.line}` }}>
                  <Mono style={{ color: C.ink }}>Download full report</Mono>
                  <Glyph d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" />
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px]">
                <div className="p-8 sm:p-10 lg:border-r" style={{ borderColor: C.line }}>
                  <h3 className="font-serif text-2xl mb-2" style={{ color: C.ink }}>AI Visibility Breakdown</h3>
                  <p className="text-sm font-medium mb-8" style={{ color: C.muted }}>
                    Presence in AI-generated answers and recommendations.
                  </p>
                  <div className="flex flex-col gap-6">
                    {BREAKDOWN.map((b) => (
                      <div key={b.name} className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-lg shrink-0" style={{ border: `1px solid ${C.line}`, background: C.bg }} />
                        <span className="text-[13px] font-semibold w-[142px] shrink-0 truncate" style={{ color: C.ink }}>{b.name}</span>
                        <span className="flex-1 min-w-0"><Bar pct={b.pct} h={5} /></span>
                        <span className="font-serif text-lg w-11 text-right shrink-0" style={{ color: C.ink }}>{b.pct}%</span>
                        <Mono className="w-[84px] text-right shrink-0" style={{ color: C.muted }}>{b.note}</Mono>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 sm:p-10 flex flex-col gap-5">
                  {[
                    ['Key insight', 'Mentioned by ChatGPT and Gemini, but not by Perplexity. Strengthening third-party mentions and authoritative content can improve coverage.'],
                    ['Top opportunity', 'Build content that answers buyer questions related to “Fintech”, and earn citations from high-authority sources in the industry.'],
                  ].map(([t, d]) => (
                    <div key={t} className="rounded-[20px] p-6" style={{ background: C.bg }}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <Glyph d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" s={14} />
                        <span className="text-[13px] font-bold" style={{ color: C.ink }}>{t}</span>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed" style={{ color: C.muted }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Stage>

          {/* ── 05 · Priority actions ──────────────────────────────────── */}
          <Stage n="05" label="Priority actions" blurb="A plan, ordered by what moves the needle first.">
            <div className={`${CARD} p-8 sm:p-10`} style={{ borderColor: C.line, ...SHADOW }}>
              <h3 className="font-serif text-2xl mb-2" style={{ color: C.ink }}>Recommended next steps</h3>
              <p className="text-sm font-medium mb-8" style={{ color: C.muted }}>Actionable steps to improve AI visibility.</p>

              <div className="flex flex-col gap-4">
                {ACTIONS.map((a) => (
                  <div key={a.t} className="rounded-[20px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5" style={{ border: `1px solid ${C.line}` }}>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                      <Glyph d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" s={16} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-bold mb-1" style={{ color: C.ink }}>{a.t}</span>
                      <span className="block text-[13px] font-medium leading-relaxed" style={{ color: C.muted }}>{a.d}</span>
                    </span>
                    <span className="flex items-center gap-8 shrink-0">
                      <span>
                        <Mono className="block mb-2" style={{ color: C.muted }}>Impact</Mono>
                        <span className="flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: i < a.impact ? C.olive : C.line }} />
                          ))}
                        </span>
                      </span>
                      <span>
                        <Mono className="block mb-2" style={{ color: C.muted }}>Priority</Mono>
                        <span
                          className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                          style={a.p === 'High' ? { background: C.lime, color: C.olive } : { background: C.bg, color: C.muted, border: `1px solid ${C.line}` }}
                        >
                          {a.p}
                        </span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-sm font-semibold" style={{ color: C.olive }}>View full action plan →</p>
            </div>
          </Stage>

          {/* ── 06 · Stay ahead ────────────────────────────────────────── */}
          <Stage n="06" label="Stay ahead" blurb="Track progress and improve over time.">
            <div className={`${CARD} p-8 sm:p-10`} style={{ borderColor: C.line, ...SHADOW }}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-7">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.oliveMid} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
                  </svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-bold mb-1" style={{ color: C.ink }}>Get monthly AI visibility updates</span>
                  <span className="block text-[13px] font-medium leading-relaxed" style={{ color: C.muted }}>
                    Updates, insights and new opportunities to keep the brand visible in AI.
                  </span>
                </span>
                <span className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <span className="rounded-full px-5 py-3 text-sm font-medium min-w-[220px]" style={{ border: `1px solid ${C.line}`, color: C.ghost }}>
                    Enter your work email
                  </span>
                  <span className="rounded-full px-6 py-3 text-sm font-semibold text-white text-center whitespace-nowrap" style={{ background: C.olive }}>
                    Get updates
                  </span>
                </span>
              </div>

              <div className="mt-8 pt-6 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: `1px solid ${C.line}` }}>
                <Mono style={{ color: C.muted }}>15 questions · 3 models · scanned Jul 26, 2026</Mono>
                <span className="text-[13px] font-semibold" style={{ color: C.olive }}>See the exact questions we asked →</span>
              </div>
            </div>
          </Stage>
        </div>

        {/* ── Close ──────────────────────────────────────────────────────── */}
        <div className="mt-24 pt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="max-w-[48ch]">
            <h2 className="font-serif text-3xl leading-tight mb-3" style={{ color: C.ink }}>
              Want this run on your brand?
            </h2>
            <p className="text-sm font-medium leading-relaxed" style={{ color: C.muted }}>
              The figures above are a worked example. A real audit runs the same six stages against
              your category and the names competing for it.
            </p>
          </div>
          <a
            href="/thallo-digital/#contact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: C.olive }}
          >
            Book an audit <span className="text-[11px]">↗</span>
          </a>
        </div>

      </div>
    </div>
  );
}
