'use client';

import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ScoreRing from './ScoreRing';
import AuditTrail from './AuditTrail';
import { PROVIDER_LABEL, type ScanPhase1 } from '@/lib/scan/types';

type Props = {
  scan: ScanPhase1;
  onUnlock: (email: string) => void;
  unlocking: boolean;
  error?: string;
};

/**
 * Free tier. Proves the problem precisely enough to be credible, and stops
 * exactly where the answer would become actionable — the competitor list is
 * the gate, not a decoration.
 */
export default function ScanResults({ scan, onUnlock, unlocking, error }: Props) {
  const [email, setEmail] = useState('');
  const zero = scan.mentions === 0;
  const platformsMentioning = scan.providers.filter((p) => p.mentions > 0).length;
  const perQuestion = scan.questions.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Headline */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-7">Results</Eyebrow>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-center">
          <ScoreRing value={scan.sovPct} label="AI visibility score" />

          <div>
            <h2 className="font-serif text-3xl sm:text-5xl text-gray-900 leading-[1.1] mb-4">
              {zero ? (
                <>
                  No model named {scan.brand} in <em>any</em> of {scan.totalAnswers} answers.
                </>
              ) : (
                <>
                  You appear in {scan.mentions} of {scan.totalAnswers} AI answers.
                </>
              )}
            </h2>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-[52ch]">
              {zero ? (
                <>
                  That is the most common result for companies that have never worked on this — and it is the
                  cheapest problem on this page to fix. Being absent means no model has a reason to name you yet,
                  not that you have been rejected.
                </>
              ) : scan.sovPct >= 40 ? (
                <>
                  That is above where category leaders usually sit (25–40%). At this level the question stops being
                  whether models know you and becomes whether they rank you first — which is what the competitor
                  list below answers.
                </>
              ) : (
                <>
                  For reference, 10–15% is typical for an established player in a category and 25–40% is where
                  category leaders sit.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Per-model breakdown */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-7">Model by model</Eyebrow>
        <div className="flex flex-col">
          {scan.providers.map((p) => {
            const pct = Math.round((p.mentions / perQuestion) * 100);
            return (
              <div
                key={p.provider}
                className="flex items-center gap-4 sm:gap-6 py-5 border-b border-gray-50 last:border-0"
              >
                <div className="w-28 sm:w-36 shrink-0">
                  <p className="text-[14px] font-bold text-gray-900">{PROVIDER_LABEL[p.provider]}</p>
                  <p className="font-mono text-[10px] text-gray-400 tracking-wide mt-0.5">{p.model}</p>
                </div>

                <div className="flex-grow h-[6px] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: p.mentions > 0 ? '#39471D' : 'transparent',
                      transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>

                <span className="font-mono text-[11px] text-gray-500 tabular-nums w-12 text-right shrink-0">
                  {p.mentions} / {perQuestion}
                </span>

                <span
                  className={`hidden sm:inline-block font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-3 py-1.5 rounded-full shrink-0 ${
                    p.mentions > 0 ? 'bg-[#39471D] text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {p.mentions > 0 ? 'Mentioned' : 'Absent'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 mt-9 rounded-2xl overflow-hidden border border-gray-100">
          <Stat value={scan.totalAnswers} label="Answers analysed" />
          <Stat value={scan.mentions} label="Times you appeared" />
          <Stat value={`${platformsMentioning} / ${scan.providers.length}`} label="Models that know you" />
          <Stat value={perQuestion} label="Buying questions" />
        </div>
      </div>

      {/* The gate */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-7">Recommended instead of you</Eyebrow>

        <div className="relative">
          <div className="flex flex-col gap-2.5 select-none" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-5 bg-[#F7F8F4] rounded-2xl px-6 py-5">
                <span className="font-mono text-[11px] text-gray-400 tabular-nums">0{i + 1}</span>
                <span className="h-3.5 rounded-full bg-gray-300 flex-grow" style={{ maxWidth: `${58 - i * 6}%` }} />
                <span className="h-3.5 w-20 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Frosted overlay carrying the capture form */}
          <div className="absolute inset-0 backdrop-blur-[6px] bg-white/70 rounded-2xl flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center py-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#39471D] mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DFFF3B" strokeWidth="2.5">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-3 leading-tight">
                See who the models name instead
              </h3>
              <p className="text-[13.5px] text-gray-600 font-medium leading-relaxed mb-6 max-w-[42ch] mx-auto">
                Unlock the competitor list, your Google AI Overview and Brand SERP position, your technical
                readiness, and a prioritised action plan.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUnlock(email);
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-grow px-5 py-3.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#39471D] transition-colors"
                />
                <button
                  type="submit"
                  disabled={unlocking}
                  className="px-7 py-3.5 bg-[#39471D] rounded-full text-sm font-bold text-white hover:bg-[#55672E] transition-colors disabled:opacity-60 shrink-0"
                >
                  {unlocking ? 'Unlocking…' : 'Unlock report'}
                </button>
              </form>

              {error && <p className="text-[12px] font-semibold text-rose-600 mt-3">{error}</p>}

              <p className="text-[11px] text-gray-400 font-medium mt-4">
                We send the report and nothing else you did not ask for.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuditTrail scan={scan} />
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="bg-white px-5 py-6 text-center">
      <p className="font-serif text-3xl text-[#39471D] tabular-nums leading-none mb-2">{value}</p>
      <p className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 leading-tight">{label}</p>
    </div>
  );
}
