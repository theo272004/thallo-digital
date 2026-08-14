'use client';

import React from 'react';
import { Radar } from 'lucide-react';
import { Head, Micro, Panel, Spinner } from './ui';
import type { ScanSession, StepStatus } from '@/lib/scan/types';

/**
 * Scanning screen.
 *
 * Every row here is driven by `session.steps`, which the backend recomputes on
 * each tick. Nothing advances on a timer — if Gemini takes eleven seconds, the
 * Gemini row spins for eleven seconds. The predecessor to this tool animated a
 * fixed sequence whatever was happening underneath, which is the same class of
 * dishonesty as inventing the score.
 *
 * Phase 2 rows show as locked rather than pending, because they genuinely do
 * not run until an email is given.
 */
export default function ScanProgress({
  session,
  brand,
  /** How many prompts this run is sending. The visitor writes them, so this is
      no longer a constant and the line under the heading must not pretend it
      is — "15 buying questions" over a three-question run is the same small
      lie as an animated progress bar. */
  asked,
}: {
  session: ScanSession;
  brand: string;
  asked: number;
}) {
  const phase1 = session.steps.filter((s) => s.phase === 1);
  const phase2 = session.steps.filter((s) => s.phase === 2);
  const active = session.status === 'unlocking' ? phase2 : phase1;
  const done = active.filter((s) => s.state === 'done' || s.state === 'skipped').length;

  const unlocking = session.status === 'unlocking';

  return (
    <Panel>
      {/* The same masthead the two setup screens carry, so the running screen
          reads as the third card in one sequence rather than as a different
          program that has taken over. The count moved into the chip for the
          same reason: at 3rem it was the largest thing on a screen whose
          subject is the list underneath it. */}
      <Head
        badge={<Radar size={18} />}
        title={unlocking ? `Finishing the report for ${brand}…` : `Asking the models about ${brand}…`}
        sub={
          unlocking
            ? 'Grounded retrieval, the search result page, and a crawl of your site.'
            : `${asked} ${asked === 1 ? 'question' : 'questions'}, three models, ${asked * 3} answers.`
        }
        chip={`${done} / ${active.length} done`}
      />

      <div className="mt-7 flex flex-col">
        {phase1.map((step) => (
          <Row key={step.id} step={step} />
        ))}
        {phase2.map((step) => (
          <Row key={step.id} step={step} />
        ))}
      </div>
    </Panel>
  );
}

function Row({ step }: { step: StepStatus }) {
  const muted = step.state === 'queued' || step.state === 'locked';
  const pct =
    step.state === 'done' ? 100 : step.state === 'running' ? 55 : step.state === 'failed' || step.state === 'skipped' ? 100 : 0;

  return (
    <div className="flex items-center gap-3.5 border-b border-gray-100 py-3.5 last:border-0">
      <Dot state={step.state} />
      <span className={`flex-1 min-w-0 truncate text-[13px] font-semibold ${muted ? 'text-gray-300' : 'text-gray-900'}`}>
        {step.label}
      </span>

      <span className="hidden h-[3px] w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:block sm:w-40">
        <span
          className={`block h-full rounded-full ${
            step.state === 'failed' || step.state === 'skipped' ? 'bg-gray-200' : 'bg-[#39471D]'
          }`}
          style={{ width: `${pct}%`, transition: 'width .6s cubic-bezier(.22,1,.36,1)' }}
        />
      </span>

      <Micro className={`w-[104px] shrink-0 truncate text-right ${muted ? 'text-gray-300' : 'text-gray-400'}`}>
        {step.detail ?? (step.state === 'locked' ? 'Locked' : '')}
      </Micro>
    </div>
  );
}

function Dot({ state }: { state: StepStatus['state'] }) {
  if (state === 'done') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#39471D]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }
  if (state === 'running') return <Spinner className="h-5 w-5 shrink-0" />;
  if (state === 'failed' || state === 'skipped') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-200">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="3.5" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </span>
    );
  }
  if (state === 'locked') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-100" />;
}
