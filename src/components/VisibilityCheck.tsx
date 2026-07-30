'use client';

import React, { useEffect, useRef, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';

/* ─── The free-preview gate ───────────────────────────────────────────────────
   One preview per browser, counted in localStorage.

   Said plainly, because pretending otherwise would be dishonest: this gate is
   client-side only and trivially bypassable. Clearing site data, a private
   window, a second browser or two lines in a console all reset it. The site is
   a static export (`output: 'export'`) — there is no backend to count a run
   against, so there is nowhere else the count could live.

   That is acceptable because nothing behind the gate is worth protecting. The
   figures are illustrative, the report is a worked example, and the thing being
   paced is a demo. The real audit is gated by talking to us. */
const STORAGE_KEY = 'thallo.ai-preview.v1';
const FREE_PREVIEWS = 1;

function readPreviewCount(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const runs = (JSON.parse(raw) as { runs?: unknown }).runs;
    return typeof runs === 'number' && Number.isFinite(runs) && runs > 0 ? Math.floor(runs) : 0;
  } catch {
    /* Safari's private mode throws on access, and a hand-edited value can fail
       to parse. Either way, read it as a first visit — a storage quirk must
       never lock someone out of the thing we are inviting them to try. */
    return 0;
  }
}

function writePreviewCount(runs: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ runs, at: new Date().toISOString() }));
  } catch {
    /* Blocked or quota-full. The preview has already run; the only cost of
       failing here is that they get another one. */
  }
}

/* ─── The sample report ───────────────────────────────────────────────────────
   Nothing below queries an AI engine. The figures are derived from a hash of
   the inputs so the same brand always gets the same preview — random numbers
   would read as random, and a demo has to survive a second look.

   Fixed from the previous version, which computed `(brand.length * 7) % 35 + 12`
   and so could only ever return 12, 19, 26, 33 or 40. That made the `> 40`
   branch unreachable: ChatGPT read "Not recommended" for every brand on earth. */
const PROMPTS = 15;

const CATEGORIES = [
  { value: 'Fintech',               label: 'Fintech & payments' },
  { value: 'Health Tech',           label: 'Health tech & recovery' },
  { value: 'SaaS',                  label: 'Enterprise software / SaaS' },
  { value: 'Professional Services', label: 'Professional services' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];
type Tone = 'on' | 'mid' | 'off';

interface Engine {
  name: string;
  pct: number;
  verdict: string;
  tone: Tone;
  note: string;
}

interface Report {
  brand: string;
  category: string;
  score: number;
  /** Engines that returned anything at all. Counted FROM the rows below, so the
      headline figure cannot drift out of step with the detail under it. */
  mentions: string;
  engines: Engine[];
  reading: string;
}

/** FNV-1a, 32-bit — small, stable, and no dependency. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function verdictFor(pct: number): { verdict: string; tone: Tone } {
  if (pct >= 60) return { verdict: 'Cited', tone: 'on' };
  if (pct >= 35) return { verdict: 'Mentioned', tone: 'on' };
  if (pct >= 18) return { verdict: 'Partial', tone: 'mid' };
  return { verdict: 'Not mentioned', tone: 'off' };
}

function buildReport(brand: string, category: CategoryValue, label: string): Report {
  const h = hash(`${brand.toLowerCase()}|${category}`);

  // 4–66 spans every verdict band, so all four are reachable — and it centres
  // low enough that a headline figure reads as a diagnosis rather than a pat on
  // the back.
  const score = 4 + (h % 63);

  // Separate slices of the same hash, so the three engines move independently
  // rather than in lockstep off one number. The offsets are kept small on
  // purpose: an engine must not come out "Mentioned" on a brand the headline
  // score has already called invisible.
  const engines: Engine[] = [
    { name: 'ChatGPT',            pct: clamp(score + ((h >>> 7) % 18) - 6) },
    { name: 'Google AI Overview', pct: clamp(score + ((h >>> 13) % 18) - 11) },
    { name: 'Perplexity',         pct: clamp(score + ((h >>> 19) % 18) - 9) },
  ].map((e) => ({
    ...e,
    ...verdictFor(e.pct),
    note: `${Math.round((e.pct / 100) * PROMPTS)} of ${PROMPTS}`,
  }));

  const seen = engines.filter((e) => e.tone !== 'off').length;
  const named = engines.filter((e) => e.tone === 'on').length;
  const cat = label.toLowerCase();

  /* Read off the rows, not off the score. Written the other way round, the
     prose could tell someone they were invisible while the table above it
     showed two engines naming them. */
  const reading =
    seen === 0
      ? `${brand} does not appear in ${cat} answers at all. Assistants fill the space with whoever has written the clearest account of themselves.`
      : named === 0
        ? `${brand} shows up at the edges of ${cat} answers — a passing reference rather than a recommendation. That is a citation problem, not an awareness one.`
        : named < engines.length
          ? `${brand} is named in some ${cat} answers and missing from the rest. The platforms that skip it have nothing authoritative to cite.`
          : `Answers about ${cat} already reach for ${brand}, though the mentions are thin — a rival that has documented itself better displaces them without much effort.`;

  return {
    brand,
    category: label,
    score,
    mentions: `${seen} of ${engines.length}`,
    engines,
    reading,
  };
}

/* ─── App chrome ──────────────────────────────────────────────────────────────
   Deliberately not the language of the marketing pages. Those use a white
   ground, 28–32px radii, pill buttons and grey hairlines. The console uses a
   deep green ground, 4–12px radii, square dark buttons, mono readouts and
   roughly half the padding — because a tool that looks like the brochure
   around it never reads as a tool.

   Contrast, checked rather than assumed. Both ends of the ground gradient
   carry white well past AA (#39471D → 10.0:1, #171A10 → 17.6:1) and #E7ECD9
   past it too (8.3:1 and 14.6:1), so body copy holds wherever it lands on the
   wash. #CBD0AC is 6.3:1 on the olive end. #55672E is only 2.8:1 on the ink
   and is therefore used for rules and dots here, never for text. */
const GROUND: React.CSSProperties = {
  backgroundImage: 'linear-gradient(158deg, #39471D 0%, #171A10 58%)',
};

/** The faint plotting grid that says "canvas" rather than "page". */
const GRID: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(231,236,217,.055) 1px, transparent 1px),' +
    'linear-gradient(to bottom, rgba(231,236,217,.055) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
};

/* White cards on dark green need their edge drawn by shadow, not by the
   hairline border the marketing cards use — a light border against the green
   reads as a seam rather than a card. */
const CARD: React.CSSProperties = { boxShadow: '0 18px 44px -26px rgba(23,26,16,.66)' };

const BTN_DARK =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#171A10] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#39471D] disabled:cursor-not-allowed disabled:opacity-40';

const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#39471D]/25 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#39471D] transition-colors hover:bg-[#E7ECD9]';

const FIELD =
  'rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-colors focus:border-[#55672E] focus:outline-none';

/** Mono micro-label. Every readout on the console is captioned with one. */
const Micro = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${className}`}>{children}</span>
);

function Meter({ pct }: { pct: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-sm bg-[#E7ECD9]">
      <span className="block h-full rounded-sm bg-[#39471D]" style={{ width: `${pct}%` }} />
    </span>
  );
}

function Verdict({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const s =
    tone === 'on'  ? 'bg-[#39471D] text-white'
  : tone === 'mid' ? 'bg-[#E7ECD9] text-[#39471D]'
  :                  'bg-gray-100 text-gray-600';
  return <Micro className={`shrink-0 whitespace-nowrap rounded-sm px-2 py-1 ${s}`}>{children}</Micro>;
}

/** A dense three-cell readout row — the console's headline figures. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-4 first:pl-0">
      <p className="text-2xl sm:text-3xl font-bold leading-none tracking-tight text-[#39471D] tabular-nums">{value}</p>
      <Micro className="mt-2.5 block text-gray-400">{label}</Micro>
    </div>
  );
}

const AUDIT_ADDS = [
  'Fifteen buyer questions, not a sample of three',
  'The brands being recommended in your place',
  'Authority and technical readiness, scored',
  'A prioritised plan you can hand to a team',
];

export default function VisibilityCheck() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<CategoryValue>('Fintech');
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [locked, setLocked] = useState(false);

  /** Previews already used. `null` = the allowance has not been read yet. */
  const [used, setUsed] = useState<number | null>(null);

  const timer = useRef<number | null>(null);

  /* localStorage does not exist while this page is prerendered, and reading it
     during render would make the server output and the first client render
     disagree — a hydration mismatch. So it is read here, after hydration.

     Until it resolves, the console shows its own boot state: never the form and
     never the lock screen, so neither can flash the wrong answer at someone
     while we are still working out which one they should see.

     react-hooks/set-state-in-effect is disabled for exactly this one line and
     nowhere else. The rule guards against effects that cascade renders on every
     change; this one runs once, on mount, and the cascade IS the point — it is
     the only moment a prerendered page is allowed to learn something the server
     could not know. */
  useEffect(() => {
    const count = readPreviewCount();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsed(count);
    if (count >= FREE_PREVIEWS) setLocked(true);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    const name = brand.trim().slice(0, 60);
    if (!name || used === null || isRunning) return;

    // Where the gate bites, in the order the flow asks for: run, report,
    // record — and the attempt after that meets the lock screen instead.
    if (used >= FREE_PREVIEWS) {
      setLocked(true);
      return;
    }

    setIsRunning(true);
    setReport(null);

    timer.current = window.setTimeout(() => {
      const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;
      setReport(buildReport(name, category, label));
      const next = used + 1;
      setUsed(next);
      writePreviewCount(next);
      setIsRunning(false);
    }, 1200);
  };

  const left = used === null ? FREE_PREVIEWS : Math.max(0, FREE_PREVIEWS - used);

  const status =
    used === null ? 'Checking allowance'
  : locked        ? 'Free preview used'
  : report        ? `Worked example · ${PROMPTS} questions · 3 platforms`
  :                 `${left} free preview${left === 1 ? '' : 's'} · no signup`;

  return (
    <section id="tool" className="relative isolate overflow-hidden pt-28 pb-16 2xl:pt-36 2xl:pb-24" style={GROUND}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />

      <div className="relative max-w-[1440px] mx-auto px-6">
        {/* Outside the gate on purpose — the prerendered HTML still says what
            this page is, whatever the console resolves to. */}
        <div className="max-w-[54ch]">
          <Eyebrow tone="light" className="mb-5">Visibility preview</Eyebrow>
          <SplitReveal
            as="h1"
            scroll={false}
            fade={false}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-4 font-sans"
            html="See how AI answers describe you."
          />
          <p className="text-[#E7ECD9] font-medium text-base leading-relaxed">
            Give it a brand and a category and it returns the shape of the report we run for
            clients. The figures are a worked example built from what you type, not a live
            query of ChatGPT, Google AI or Perplexity.
          </p>
        </div>

        {/* Panel chrome — the strip a tool wears and a brochure does not. */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E7ECD9]/15 px-4 py-2.5">
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CBD0AC]" />
            <Micro className="text-[#E7ECD9]">Thallo AI · visibility console</Micro>
          </span>
          <Micro className="text-[#CBD0AC]">{status}</Micro>
        </div>

        <div className="mt-3">
          {used === null ? (
            /* Boot. Identical on the server and on the first client render, so
               there is nothing for React to disagree with. */
            <div className="rounded-xl bg-white p-5 sm:p-6 lg:min-h-[420px]" style={CARD} aria-busy="true">
              <Micro className="text-gray-400">Console</Micro>
              <div className="mt-6 flex flex-col gap-3">
                {[62, 100, 84, 46].map((w) => (
                  <span key={w} className="block h-3 rounded-sm bg-[#E7ECD9]" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="mt-7 text-[11px] font-medium text-gray-500">Restoring your session…</p>
            </div>
          ) : locked ? (
            /* ── Lock screen ─────────────────────────────────────────────── */
            <div className="rounded-xl bg-white p-6 sm:p-10" style={CARD}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] items-start gap-8 lg:gap-14">
                <div>
                  <Micro className="text-gray-400">Preview limit</Micro>
                  <h2 className="mt-5 mb-3 text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight text-gray-900">
                    That is the free preview used.
                  </h2>
                  <p className="mb-7 max-w-[52ch] text-base font-medium leading-relaxed text-gray-500">
                    One per browser, so the console stays quick for everyone. A commissioned
                    audit is the same report run properly against your own category — with the
                    names being recommended instead of you, and a plan ordered by what moves
                    first.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a href="/thallo-digital/contact/" className={BTN_DARK}>
                      Book an audit <ArrowUpRight className="text-[11px]" />
                    </a>
                    <a href="/thallo-digital/services/" className={BTN_GHOST}>
                      See what we do
                    </a>
                  </div>
                </div>

                <div className="w-full rounded-lg bg-[#F4FAF5] p-5">
                  <Micro className="text-[#39471D]">What the audit adds</Micro>
                  <ul className="mt-4 flex flex-col gap-3">
                    {AUDIT_ADDS.map((a) => (
                      <li key={a} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#39471D]" />
                        <span className="text-[13px] font-medium leading-snug text-gray-600">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Honest about what the count is worth. */}
              <p className="mt-8 border-t border-gray-100 pt-5">
                <Micro className="text-gray-400">Counted in this browser only · clearing site data resets it</Micro>
              </p>
            </div>
          ) : (
            /* ── Console ─────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              <form onSubmit={handleRun} className="flex flex-col rounded-xl bg-white p-5 sm:p-6" style={CARD}>
                <Micro className="text-gray-400">Parameters</Micro>

                <div className="mt-5 flex flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <Micro className="text-gray-900">Brand name</Micro>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Ledgerly"
                      maxLength={60}
                      autoComplete="organization"
                      required
                      className={FIELD}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <Micro className="text-gray-900">Category</Micro>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryValue)}
                      className={FIELD}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <button type="submit" disabled={isRunning} className={`mt-6 w-full ${BTN_DARK}`}>
                  {isRunning ? 'Running…' : report ? 'Run another preview' : 'Run preview'}
                </button>

                <p className="mt-4 border-t border-gray-100 pt-4 text-[11px] font-medium leading-relaxed text-gray-500">
                  No signup. One free preview per browser, returning illustrative figures — a
                  commissioned audit queries the platforms properly.
                </p>
              </form>

              <div
                className="flex flex-col rounded-xl bg-white p-5 sm:p-6 lg:min-h-[420px]"
                style={CARD}
                aria-live="polite"
              >
                {isRunning ? (
                  <div className="m-auto w-full max-w-[32ch] text-center">
                    <span className="mx-auto mb-4 block h-5 w-5 animate-spin rounded-full border-2 border-[#39471D] border-t-transparent" />
                    <Micro className="text-gray-500">Composing your sample report…</Micro>
                  </div>
                ) : report ? (
                  <>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
                      <p className="max-w-[28ch] truncate text-[15px] font-bold tracking-tight text-gray-900">
                        {report.brand}
                      </p>
                      <Micro className="text-gray-400">{report.category} · illustrative</Micro>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
                      <Stat value={`${report.score}%`} label="Visibility score" />
                      <Stat value={report.mentions} label="Engines naming you" />
                      <Stat value={String(PROMPTS)} label="Questions sampled" />
                    </div>

                    <div className="flex flex-col gap-4 py-6">
                      {report.engines.map((e) => (
                        <div key={e.name} className="flex items-center gap-3">
                          <span className="w-[118px] shrink-0 text-[13px] font-semibold text-gray-900 sm:w-[152px]">
                            {e.name}
                          </span>
                          <span className="min-w-0 flex-1"><Meter pct={e.pct} /></span>
                          <span className="w-10 shrink-0 text-right text-[13px] font-bold text-gray-900 tabular-nums">
                            {e.pct}%
                          </span>
                          <span className="hidden w-[68px] shrink-0 text-right sm:block">
                            <Micro className="text-gray-400">{e.note}</Micro>
                          </span>
                          <Verdict tone={e.tone}>{e.verdict}</Verdict>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-[#F4FAF5] p-4 sm:p-5">
                      <Micro className="text-[#39471D]">Reading</Micro>
                      <p className="mt-2.5 text-[13px] font-medium leading-relaxed text-gray-600">{report.reading}</p>
                    </div>

                    {/* Replaces a link that scrolled to `#cta` — an id that only
                        ever existed on the home page, so it silently did nothing
                        here. A real destination instead. */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a href="/thallo-digital/contact/" className={`${BTN_DARK} shrink-0`}>
                        Book the full audit <ArrowUpRight className="text-[11px]" />
                      </a>
                      <p className="text-[11px] font-medium leading-relaxed text-gray-500">
                        The audit runs this report against your category, with the names being
                        recommended instead of you.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="m-auto w-full max-w-[36ch] text-center">
                    <span className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F4FAF5]">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 20V10M9 20V4M15 20v-7M21 20v-11" />
                      </svg>
                    </span>
                    <Micro className="mb-2.5 block text-gray-400">No report yet</Micro>
                    <p className="text-[13px] font-medium leading-relaxed text-gray-500">
                      Fill in the two fields and run the preview. It returns a worked example of
                      the report — the shape and the sections, with figures built from your inputs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
