'use client';

import React, { useState } from 'react';
import ConsentCheck from '@/components/ui/ConsentCheck';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import { BTN_DARK, FIELD, Meter, Micro, Notice, Panel, ProviderMark, Spinner, Stat, Verdict, type Tone } from './ui';
import { PROVIDER_LABEL, type ProviderResult, type ScanPhase1 } from '@/lib/scan/types';

const LOCKED = [
  'Which competitors are recommended instead of you',
  'Perplexity and Google AI Overview presence',
  'Whether AI crawlers can reach your site',
  'Authority, schema and citation signals',
  'A prioritised action plan',
];

function toneFor(p: ProviderResult, total: number): { tone: Tone; verdict: string } {
  if (p.error) return { tone: 'off', verdict: 'Unavailable' };
  const pct = total ? (p.mentions / total) * 100 : 0;
  if (pct >= 40) return { tone: 'on', verdict: 'Recommended' };
  if (pct > 0) return { tone: 'mid', verdict: 'Mentioned' };
  return { tone: 'off', verdict: 'Not mentioned' };
}

/**
 * Phase 1, and the gate.
 *
 * The finding is given in full before anything is asked for. Withholding the
 * headline until an email arrives would make the score bait; the email buys the
 * *diagnosis* — who is being recommended instead, and what to do about it —
 * which is the part that costs us money to produce.
 */
export default function ScanResults({
  phase1,
  onUnlock,
  unlocking,
  error,
}: {
  phase1: ScanPhase1;
  onUnlock: (email: string) => void;
  unlocking: boolean;
  error?: string;
}) {
  const [email, setEmail] = useState('');
  const perProvider = phase1.questions.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlocking && email.trim()) onUnlock(email.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5">
          <p className="max-w-[32ch] truncate text-[15px] font-bold tracking-tight text-gray-900">{phase1.brand}</p>
          <Micro className="text-gray-400">
            {phase1.industry} · {new Date(phase1.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Micro>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 border-y border-gray-100 py-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <ScoreRing pct={phase1.sovPct} label="Share of voice" />

          <div className="flex flex-col gap-4">
            {phase1.providers.map((p) => {
              const { tone, verdict } = toneFor(p, perProvider);
              const pct = perProvider ? Math.round((p.mentions / perProvider) * 100) : 0;
              return (
                <div key={p.provider} className="flex items-center gap-3">
                  <ProviderMark provider={p.provider} />
                  <span className="w-[84px] shrink-0 text-[13px] font-semibold text-gray-900 sm:w-[128px]">
                    {PROVIDER_LABEL[p.provider]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Meter pct={p.error ? 0 : pct} tone={p.error ? 'grey' : 'olive'} />
                  </span>
                  <span className="w-10 shrink-0 text-right text-[13px] font-bold text-gray-900 tabular-nums">
                    {p.error ? '—' : `${pct}%`}
                  </span>
                  <span className="hidden w-[76px] shrink-0 text-right sm:block">
                    <Micro className="text-gray-400">{p.error ? 'no answer' : `${p.mentions} of ${perProvider}`}</Micro>
                  </span>
                  <Verdict tone={tone}>{verdict}</Verdict>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 sm:grid-cols-4">
          <Stat value={String(phase1.totalAnswers)} label="Answers read" />
          <Stat value={String(phase1.mentions)} label="Times you appeared" />
          <Stat
            value={phase1.avgPosition === null ? '—' : String(phase1.avgPosition)}
            label="Average rank"
            muted={phase1.avgPosition === null}
          />
          <Stat value={String(phase1.providers.filter((p) => p.mentions > 0).length)} label="Models naming you" />
        </div>

        <div className="pt-5">
          <AuditTrail phase1={phase1} />
        </div>
      </Panel>

      {/* ── The gate ─────────────────────────────────────────────────────── */}
      <Panel>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px] lg:gap-14">
          <div>
            <Micro className="text-gray-400">Second half</Micro>
            <h2 className="mt-4 mb-3 text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight text-gray-900">
              Now the part that says what to do about it.
            </h2>
            <p className="mb-6 max-w-[54ch] text-[15px] font-medium leading-relaxed text-gray-500">
              The rest of the scan costs us money to run — live retrieval, a search result page, and a crawl of{' '}
              {phase1.domain}. We will run it now in exchange for an email, and send you the report so you do not
              have to keep this tab open.
            </p>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  disabled={unlocking}
                  className={`${FIELD} sm:max-w-[300px]`}
                />
                <button type="submit" disabled={unlocking} className={`${BTN_DARK} shrink-0`}>
                  {unlocking ? (
                    <>
                      <Spinner className="h-3.5 w-3.5 border-white/40 border-t-transparent" /> Running
                    </>
                  ) : (
                    'Unlock the full report'
                  )}
                </button>
              </div>
              <ConsentCheck id="scan-consent" />
              {error && <Notice>{error}</Notice>}
            </form>
          </div>

          <div className="w-full rounded-lg bg-[#F4FAF5] p-5">
            <Micro className="text-[#39471D]">Still locked</Micro>
            <ul className="mt-4 flex flex-col gap-3">
              {LOCKED.map((l) => (
                <li key={l} className="flex items-start gap-2.5">
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="#39471D"
                    strokeWidth="2.2"
                    className="mt-0.5 shrink-0"
                  >
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span className="text-[13px] font-medium leading-snug text-gray-600">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}
