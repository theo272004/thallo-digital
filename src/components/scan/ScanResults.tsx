'use client';

import React, { useState } from 'react';
import ConsentCheck from '@/components/ui/ConsentCheck';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import { BarChart3, LockKeyhole } from 'lucide-react';
import { BTN_PRIMARY, FIELD, Head, Meter, Micro, Notice, Panel, ProviderMark, Spinner, Stat, Tint, Verdict, type Tone } from './ui';
import { marketLabel } from '@/lib/scan/markets';
import { PROVIDER_LABEL, type ProviderResult, type ScanPhase1 } from '@/lib/scan/types';

const LOCKED = [
  'Which competitors are recommended instead of you',
  'Perplexity and Google AI Overview presence',
  'Whether AI crawlers can reach your site',
  'Authority, schema and citation signals',
  'A prioritised action plan',
];

/**
 * The denominator is the answers this model actually gave, not the questions it
 * was asked.
 *
 * They are the same number on a clean run and come apart the moment one call
 * fails — and the headline above these bars has always counted only answers
 * that came back. Dividing by questions here meant a model that answered three
 * of five and named the brand in two was drawn at 40% beside a ring reading
 * 67%, from the same run, with the smaller figure understating the brand for a
 * reason that was our fault rather than theirs.
 */
function shareFor(p: ProviderResult): { answers: number; pct: number } {
  const answers = p.answers.length;
  return { answers, pct: answers ? Math.round((p.mentions / answers) * 100) : 0 };
}

function toneFor(p: ProviderResult, pct: number): { tone: Tone; verdict: string } {
  /* "Unavailable", not "Not mentioned". The row for a model we could not reach
     must not look like the row for a model that did not name the brand — one is
     our fault and the other is the finding. */
  if (p.error) return { tone: 'off', verdict: 'Not measured' };
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlocking && email.trim()) onUnlock(email.trim());
  };

  return (
    <div className="flex flex-col gap-5">
      <Panel>
        {/* The market belongs on the dateline, not in a footnote. A share of
            voice is only a finding about a brand once you know which market it
            was measured in — the same brand can be 40% in one and 0% in the
            next, and both readings are correct. */}
        <Head
          badge={<BarChart3 size={18} />}
          title={`What the models say about ${phase1.brand}`}
          sub={`${phase1.industry} · ${marketLabel(phase1.market)} · ${new Date(phase1.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        />

        <div className="mt-7 grid grid-cols-1 items-center gap-8 border-y border-gray-100 py-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          {/* Named as the memory reading even though nothing here shows a second
              one. This screen is phase 1: the models answering from what they
              already hold, with the web shut. Calling it plain "share of voice"
              invites the reader to check it by asking Claude — which searches —
              and conclude the tool is lying when the two disagree. They are
              different questions, and the label is where that starts. */}
          <ScoreRing pct={phase1.sovPct} label="Share of voice · from memory" />

          <div className="flex flex-col gap-4">
            {phase1.providers.map((p) => {
              const { answers, pct } = shareFor(p);
              const { tone, verdict } = toneFor(p, pct);
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
                    {/* "of 4" when a fifth call failed. The count of questions
                        asked is printed under the audit trail, so a reader can
                        see the difference rather than be handed a rounder
                        number that quietly disagrees with the ring. */}
                    <Micro className="text-gray-400">{p.error ? 'our end' : `${p.mentions} of ${answers}`}</Micro>
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
            <Head
              badge={<LockKeyhole size={18} />}
              title="Now the part that says what to do about it."
              sub={`The rest of the scan costs us money to run — live retrieval, a search result page, and a crawl of ${phase1.domain}. We will run it now in exchange for an email, and send you the report so you do not have to keep this tab open.`}
            />

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
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
                <button type="submit" disabled={unlocking} className={`${BTN_PRIMARY} shrink-0`}>
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

          <Tint className="w-full">
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
          </Tint>
        </div>
      </Panel>
    </div>
  );
}
