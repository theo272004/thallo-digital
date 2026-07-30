'use client';

import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal, scrollToEl } from '@/components/motion';

/* Guidelines, section 8 — one soft olive-tinted shadow. Elevation is only ever
   suggested; it never defines the component. */
const SOFT = { boxShadow: '0 24px 60px -20px rgba(57,71,29,.20)' };

/* The three platforms we hold real marks for. No logo is invented here. */
const LOGO = {
  chatgpt: '/thallo-digital/logos/chatgpt.svg',
  google: '/thallo-digital/logos/google.svg',
  perplexity: '/thallo-digital/logos/perplexity.png',
} as const;

const PlatformMark = ({ src, name }: { src?: string; name: string }) => (
  <span className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 p-1.5">
    {src ? (
      <img src={src} alt="" aria-hidden="true" width={20} height={20} className="w-full h-full object-contain" />
    ) : (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    )}
    <span className="sr-only">{name}</span>
  </span>
);

/* The three inputs a run takes, described rather than mocked up. There used to
   be a fake form here — read-only pills and a <div> dressed as a button — which
   now competes with the working console at the top of the page. One live
   control per job. */
const SETUP: [string, string][] = [
  ['Brand name', 'The name you want an assistant to reach for.'],
  ['Industry / target query', 'The category buyers actually type, not the internal label for it.'],
  ['Website URL', 'Optional in the preview; a commissioned audit reads it for technical readiness.'],
];

const ANALYZE = [
  'AI Recommendations (ChatGPT, Google AI, Perplexity)',
  'Brand Mentions & Citations',
  'Google AI Overview Presence',
  'Authority & Trust Signals',
  'Technical Readiness',
  'Priority Action Plan',
];

const SCAN = [
  { name: 'ChatGPT',                 logo: LOGO.chatgpt,    pct: 72, state: 'Scanning…' },
  { name: 'Google AI Overview',      logo: LOGO.google,     pct: 54, state: 'Scanning…' },
  { name: 'Perplexity',              logo: LOGO.perplexity, pct: 31, state: 'Scanning…' },
  { name: 'Website & Technical SEO', logo: undefined,       pct: 0,  state: 'Waiting…'  },
];

const PRESENCE = [
  { name: 'ChatGPT',            logo: LOGO.chatgpt,    sub: 'Found in 3 of 5 answers',     tag: 'Mentioned',     tone: 'on'  },
  { name: 'Google AI Overview', logo: LOGO.google,     sub: 'Appears in related overview', tag: 'Partial',       tone: 'mid' },
  { name: 'Perplexity',         logo: LOGO.perplexity, sub: 'Found in 0 of 5 answers',     tag: 'Not mentioned', tone: 'off' },
];

const TILES = [
  { n: '15', l: 'Questions analyzed' },
  { n: '4',  l: 'AI mentions' },
  { n: '2',  l: 'Platforms mentioned' },
  { n: '11', l: 'Opportunities found' },
];

const BREAKDOWN = [
  { name: 'ChatGPT',            logo: LOGO.chatgpt,    pct: 60, note: '3 / 5 answers' },
  { name: 'Google AI Overview', logo: LOGO.google,     pct: 40, note: 'Partial presence' },
  { name: 'Perplexity',         logo: LOGO.perplexity, pct: 0,  note: '0 / 5 answers' },
];

const ACTIONS = [
  { t: 'Create authoritative comparison content',    d: 'Build in-depth comparison pages for the key solutions in your category.',  impact: 4, p: 'High'   },
  { t: 'Earn mentions from trusted websites',        d: 'Acquire backlinks and brand mentions from high-authority sites.',          impact: 3, p: 'High'   },
  { t: 'Optimize for AI-friendly content structure', d: 'Clear headings, summaries and structured data for better AI parsing.',     impact: 3, p: 'Medium' },
];

/* ── Primitives ─────────────────────────────────────────────────────────── */

/** Stage number + label. Space Mono, per guidelines §1 — "números de procesos". */
function Rail({ n, label, blurb }: { n: string; label: string; blurb: string }) {
  return (
    <div className="lg:pt-1">
      <p className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#55672E] mb-4">{n}</p>
      <h3 className="text-2xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-3">{label}</h3>
      <p className="text-sm font-medium leading-relaxed text-gray-500 max-w-[30ch]">{blurb}</p>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">{children}</span>
);

function Bar({ pct, h = 5 }: { pct: number; h?: number }) {
  return (
    <span className="block w-full rounded-full bg-gray-100 overflow-hidden" style={{ height: h }}>
      <span className="block h-full rounded-full bg-[#39471D]" style={{ width: `${pct}%` }} />
    </span>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: string }) {
  const s =
    tone === 'on'  ? 'bg-[#39471D] text-white'
  : tone === 'mid' ? 'bg-[#E7ECD9] text-[#39471D]'
  :                  'bg-white text-gray-400 border border-gray-200';
  return (
    <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${s}`}>
      {children}
    </span>
  );
}

const Check = () => (
  <span className="w-6 h-6 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 mt-px">
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#39471D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </span>
);

/** Section shell — white ground, the site's vertical rhythm, hairline divider. */
const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-start">{children}</div>
    </div>
  </section>
);

export default function ThalloAIPage() {
  const R = 54;
  const CIRC = 2 * Math.PI * R;

  return (
    <>
      {/* ── Intro ────────────────────────────────────────────────────────────
          The page h1 belongs to the console above this now, so this heading
          steps down to h2 — and to the standard section rhythm with it, since
          it is no longer clearing the fixed navbar. */}
      <section className="bg-white py-16 2xl:py-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <Eyebrow center className="mb-5">Thallo AI Visibility Engine</Eyebrow>
          {/* text-balance rather than a hard break — a <br/> here strands the
              last word on its own line at mid widths. */}
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-3xl text-balance">
            What a commissioned audit looks like, end to end.
          </h2>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[56ch] mb-8">
            The console above returns a worked example in a few seconds. Below is the whole journey
            of a Thallo visibility audit — six stages, from the question you type to the plan you
            act on.
          </p>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]" />
            <Label>Sample report · illustrative figures</Label>
          </span>
        </div>
      </section>

      {/* ── 01 · Audit setup ──────────────────────────────────────────────── */}
      <Section>
        <Rail n="01" label="Audit setup" blurb="Tell us about your brand and the category you want to be found in." />
        <div className="rounded-[28px] border border-gray-100 bg-white overflow-hidden" style={SOFT}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 sm:p-10 md:border-r border-gray-100">
              <Label>Audit parameters</Label>
              <p className="mt-6 text-sm font-medium leading-relaxed text-gray-500 max-w-[38ch]">
                Three inputs decide the whole run. The console above takes the first two; a
                commissioned audit takes all three, and the competitor set with them.
              </p>
              <dl className="mt-7">
                {SETUP.map(([term, def]) => (
                  <div key={term} className="mb-5 last:mb-0">
                    <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1.5">{term}</dt>
                    <dd className="text-sm font-medium leading-relaxed text-gray-900 max-w-[38ch]">{def}</dd>
                  </div>
                ))}
              </dl>
              <a
                href="#tool"
                onClick={(e) => { e.preventDefault(); scrollToEl('#tool'); }}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#39471D] hover:text-[#55672E] transition-colors"
              >
                Run the free preview <ArrowUpRight className="text-[11px]" />
              </a>
              <p className="mt-6 rounded-2xl bg-gray-50/60 p-4 text-[11px] font-semibold leading-relaxed text-gray-500">
                No signup. One free preview per browser, with illustrative figures — the
                commissioned audit queries ChatGPT, Google AI and Perplexity properly.
              </p>
            </div>

            <div className="p-8 sm:p-10 relative overflow-hidden">
              <Label>What we will analyze</Label>
              <ul className="mt-7 flex flex-col gap-4 relative z-10">
                {ANALYZE.map((a) => (
                  <li key={a} className="flex items-start gap-3">
                    <Check />
                    <span className="text-sm font-medium leading-snug text-gray-900">{a}</span>
                  </li>
                ))}
              </ul>
              <img
                src="/thallo-digital/isotipo.png" alt="" aria-hidden="true" loading="lazy" decoding="async"
                width={512} height={512}
                className="absolute -bottom-10 -right-10 w-48 h-48 object-contain opacity-[0.06] rotate-[14deg] pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── 02 · Scanning ─────────────────────────────────────────────────── */}
      <Section>
        <Rail n="02" label="Scanning" blurb="Our agents read how each platform answers for your category." />
        <div className="rounded-[28px] border border-gray-100 bg-white p-8 sm:p-10" style={SOFT}>
          <h4 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Scanning your visibility…</h4>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-14">
            <div className="flex flex-col gap-6">
              {SCAN.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <PlatformMark src={s.logo} name={s.name} />
                  <span className="text-sm font-semibold text-gray-900 w-[190px] shrink-0">{s.name}</span>
                  <span className="flex-1 min-w-0"><Bar pct={s.pct} /></span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 w-[72px] text-right shrink-0">{s.state}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-gray-50/60 border border-gray-100 p-7">
              <Label>Live progress</Label>
              <p className="mt-4 text-5xl font-extrabold tracking-tight text-gray-900 leading-none mb-2">
                2 <span className="text-2xl font-bold text-gray-400">/ 4</span>
              </p>
              <p className="text-sm font-medium text-gray-500 mb-5">Platforms scanned</p>
              <Bar pct={50} h={6} />
              <p className="mt-6 pt-5 border-t border-gray-100 text-[11px] font-semibold leading-relaxed text-gray-500">
                This usually takes 20–30 seconds.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 03 · Results overview ─────────────────────────────────────────── */}
      <Section>
        <Rail n="03" label="Results overview" blurb="How the brand performs across every AI platform we check." />
        <div className="flex flex-col gap-5">
          <div className="rounded-[28px] border border-gray-100 bg-white overflow-hidden" style={SOFT}>
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="p-8 sm:p-10 lg:border-r border-gray-100">
                <Label>AI visibility score</Label>
                <div className="relative w-[196px] h-[196px] mx-auto mt-7">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r={R} fill="none" stroke="#F2F1ED" strokeWidth="10" />
                    <circle cx="60" cy="60" r={R} fill="none" stroke="#39471D" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${CIRC * 0.27} ${CIRC}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900 leading-none">27%</span>
                    <span className="mt-2 text-[11px] font-semibold text-center leading-tight text-gray-400">
                      Your visibility<br />score
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 lg:border-r border-gray-100">
                <Label>AI platform presence</Label>
                <div className="mt-6 flex flex-col gap-3">
                  {PRESENCE.map((p) => (
                    <div key={p.name} className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                      <PlatformMark src={p.logo} name={p.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold text-gray-900 truncate">{p.name}</span>
                        <span className="block text-[11px] font-medium text-gray-400 truncate">{p.sub}</span>
                      </span>
                      <Tag tone={p.tone}>{p.tag}</Tag>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors stay redacted — naming real rivals inside sample
                  data would be a claim we cannot stand behind. */}
              <div className="p-8 sm:p-10">
                <Label>Recommended instead of you</Label>
                <div className="mt-6 flex flex-col gap-3">
                  {[8, 7, 6, 6].map((n, i) => (
                    <div key={i} className="rounded-2xl bg-gray-50/60 p-4 flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold text-gray-400">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block h-2.5 rounded-full bg-gray-200 mb-1.5" style={{ width: `${66 - i * 6}%` }} />
                        <span className="block text-[11px] font-medium text-gray-400">Mentioned in {n} answers</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TILES.map((t) => (
              <div key={t.l} className="rounded-3xl bg-gray-50/60 border border-gray-100 px-7 py-7">
                <p className="text-4xl font-extrabold tracking-tight text-gray-900 leading-none mb-3">{t.n}</p>
                <Label>{t.l}</Label>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 04 · Detailed report ──────────────────────────────────────────── */}
      <Section>
        <Rail n="04" label="Detailed report" blurb="Deeper insight across every category we score." />
        <div className="rounded-[28px] border border-gray-100 bg-white overflow-hidden" style={SOFT}>
          <div className="px-8 sm:px-10 pt-7 border-b border-gray-100 flex flex-wrap items-center gap-x-9 gap-y-3 justify-between">
            <div className="flex flex-wrap gap-x-9 gap-y-3">
              {['AI visibility', 'Authority', 'Content', 'Technical', 'Comparisons'].map((t, i) => (
                <span key={t} className={`pb-4 -mb-px ${i === 0 ? 'border-b-2 border-[#39471D]' : ''}`}>
                  <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${i === 0 ? 'text-gray-900' : 'text-gray-400'}`}>{t}</span>
                </span>
              ))}
            </div>
            <span className="mb-4 rounded-full border border-gray-200 px-4 py-2 flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gray-800">Download full report</span>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round">
                <path d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" />
              </svg>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
            <div className="p-8 sm:p-10 lg:border-r border-gray-100">
              <h4 className="text-xl font-bold tracking-tight text-gray-900 mb-2">AI Visibility Breakdown</h4>
              <p className="text-sm font-medium text-gray-500 mb-8">Presence in AI-generated answers and recommendations.</p>
              <div className="flex flex-col gap-7">
                {BREAKDOWN.map((b) => (
                  <div key={b.name} className="flex items-center gap-4">
                    <PlatformMark src={b.logo} name={b.name} />
                    <span className="text-[13px] font-bold text-gray-900 w-[168px] shrink-0">{b.name}</span>
                    <span className="flex-1 min-w-0"><Bar pct={b.pct} /></span>
                    <span className="text-[13px] font-bold text-gray-900 w-12 text-right shrink-0 tabular-nums">{b.pct}%</span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 w-[96px] text-right shrink-0">{b.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-10 flex flex-col gap-5">
              {[
                ['Key insight', 'Mentioned by ChatGPT and partially in Google AI Overview, but absent from Perplexity. Strengthening third-party mentions and authoritative content can improve coverage.'],
                ['Top opportunity', 'Build content that answers the buyer questions around “Fintech”, and earn citations from high-authority sources in the industry.'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-3xl bg-gray-50/60 p-7">
                  <div className="flex items-center gap-2.5 mb-3">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                    </svg>
                    <span className="text-[13px] font-bold text-gray-900">{t}</span>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-gray-500">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 05 · Priority actions ─────────────────────────────────────────── */}
      <Section>
        <Rail n="05" label="Priority actions" blurb="A plan, ordered by what moves the needle first." />
        <div className="rounded-[28px] border border-gray-100 bg-white p-8 sm:p-10" style={SOFT}>
          <h4 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Recommended next steps</h4>
          <p className="text-sm font-medium text-gray-500 mb-8">Actionable steps to improve AI visibility.</p>

          <div className="flex flex-col gap-4">
            {ACTIONS.map((a) => (
              <div key={a.t} className="rounded-3xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-20px_rgba(57,71,29,.20)]">
                <span className="w-10 h-10 rounded-xl bg-gray-50/60 border border-gray-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-bold text-gray-900 mb-1">{a.t}</span>
                  <span className="block text-sm font-medium leading-relaxed text-gray-500">{a.d}</span>
                </span>
                <span className="flex items-center gap-10 shrink-0">
                  <span>
                    <Label>Impact</Label>
                    <span className="flex gap-1.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`w-[7px] h-[7px] rounded-full ${i < a.impact ? 'bg-[#39471D]' : 'bg-gray-200'}`} />
                      ))}
                    </span>
                  </span>
                  <span>
                    <Label>Priority</Label>
                    <span className={`block mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full text-center ${a.p === 'High' ? 'bg-[#39471D] text-white' : 'bg-[#E7ECD9] text-[#39471D]'}`}>
                      {a.p}
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm font-semibold text-[#39471D]">View full action plan →</p>
        </div>
      </Section>

      {/* ── 06 · Stay ahead ───────────────────────────────────────────────── */}
      <Section>
        <Rail n="06" label="Stay ahead" blurb="Track progress and improve over time." />
        <div className="rounded-[28px] border border-gray-100 bg-white p-8 sm:p-10" style={SOFT}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-7">
            <span className="w-11 h-11 rounded-xl bg-gray-50/60 border border-gray-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#39471D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
              </svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-bold text-gray-900 mb-1">Get monthly AI visibility updates</span>
              <span className="block text-sm font-medium leading-relaxed text-gray-500">
                Updates, insights and new opportunities to keep your brand visible in AI.
              </span>
            </span>
            <span className="flex flex-col sm:flex-row gap-3 shrink-0">
              <span className="rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-400 min-w-[240px]">
                Enter your work email
              </span>
              <span className="rounded-full bg-[#39471D] px-7 py-3 text-sm font-semibold text-white text-center whitespace-nowrap">
                Get updates
              </span>
            </span>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              15 questions · 3 platforms · scanned Jul 26, 2026
            </span>
            <span className="text-[13px] font-semibold text-[#39471D]">See the exact questions we asked →</span>
          </div>
        </div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">
            <img loading="lazy" decoding="async"
              src="/thallo-digital/cta-bg.webp"
              alt="" aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ zIndex: 0 }}
            />
            <div className="relative z-[2] max-w-xl">
              <Eyebrow tone="light" className="mb-6">Your brand</Eyebrow>
              <SplitReveal
                as="h2"
                className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans"
                html="Run this on your own name."
              />
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[46ch] mb-8">
                The figures above are a worked example. A real audit runs the same six stages against
                your category and the names competing for it.
              </p>
              <a
                href="/thallo-digital/contact/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                Book an audit <ArrowUpRight className="text-[11px]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
