'use client';

import React, { useCallback, useRef, useState } from 'react';
import { SplitReveal } from '@/components/motion';
import ScanSetup from './ScanSetup';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';
import FullReport from './FullReport';
import { GRID, GROUND, Micro } from './ui';
import { IS_LIVE, initialSession, startScan, unlockScan } from '@/lib/scan/engine';
import { QUESTION_COUNT } from '@/lib/scan/questions';
import { LIMITS } from '@/lib/scan/limits';
import { BASE } from '@/lib/site';
import type { ScanInput, ScanSession } from '@/lib/scan/types';

type Stage = 'setup' | 'scanning' | 'results' | 'report';

export default function ScanFlow() {
  const [stage, setStage] = useState<Stage>('setup');
  const [session, setSession] = useState<ScanSession>(initialSession);
  /** Kept separately so the scanning screen can name the brand before the
      first tick comes back with it. */
  const [pending, setPending] = useState<ScanInput | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  /* Each stage is a full screen change, so put the reader at the top of it —
     but only on a change, never on a tick, or the page would fight the scroll
     every 400ms while a scan is running. */
  const goto = useCallback((next: Stage) => {
    setStage(next);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const start = async (input: ScanInput) => {
    setError('');
    setPending(input);
    setSession(initialSession());
    goto('scanning');
    try {
      const done = await startScan(input, setSession);
      setSession(done);
      goto('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The scan could not be completed. Please try again.');
      goto('setup');
    }
  };

  const unlock = async (email: string) => {
    if (!session.phase1) return;
    setUnlocking(true);
    setError('');
    /* The progress screen comes back for phase 2 rather than a spinner inside
       the gate: the second half is three more units of real work, and hiding
       that behind a button that just says "Running" throws away the only
       evidence the visitor has that anything is happening. */
    goto('scanning');
    try {
      const done = await unlockScan(session, email, setSession);
      setSession(done);
      goto('report');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not unlock the report. Please try again.');
      goto('results');
    } finally {
      setUnlocking(false);
    }
  };

  const reset = () => {
    setSession(initialSession());
    setPending(null);
    setError('');
    goto('setup');
  };

  const brand = session.phase1?.brand ?? pending?.brand ?? 'your brand';

  const status =
    stage === 'setup'
      ? `${QUESTION_COUNT} questions · 3 models · free`
      : stage === 'scanning'
        ? session.status === 'unlocking'
          ? 'Running the second half'
          : 'Scan in progress'
        : stage === 'results'
          ? 'Phase 1 complete'
          : 'Full report';

  return (
    /* pt-32 rather than pt-28: the label above the heading is gone, and at the
       old padding the h1 came within 26px of the floating navbar. */
    <section id="tool" className="relative isolate overflow-hidden pt-32 pb-16 2xl:pt-40 2xl:pb-24" style={GROUND}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />

      <div className="relative mx-auto max-w-[1440px] px-6">
        {/* Outside the flow on purpose — the prerendered HTML still says what
            this page is, whatever the console resolves to.

            An h2, not an h1: the presentation above owns the page's heading
            now. Two h1s would have left the document with no single answer to
            "what is this page", on a page whose whole subject is being legible
            to machines. */}
        <div className="max-w-[58ch]">
          <SplitReveal
            as="h2"
            scroll={false}
            fade={false}
            className="mb-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
            html="Do the models recommend you?"
          />
          <p className="text-base font-medium leading-relaxed text-[#E7ECD9]">
            We put the questions your buyers ask to ChatGPT, Claude and Gemini, and count how often your name comes
            up. Your brand is never named in the question. You can see every question we sent.
          </p>
        </div>

        {(!IS_LIVE || session.demo) && <DemoNotice configured={IS_LIVE} />}

        {/* Panel chrome — the strip a tool wears and a brochure does not. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E7ECD9]/15 px-4 py-2.5">
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CBD0AC]" />
            <Micro className="text-[#E7ECD9]">Thallo AI · visibility console</Micro>
          </span>
          <span className="flex items-center gap-4">
            {stage !== 'setup' && (
              <button
                type="button"
                onClick={reset}
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#CBD0AC] underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Scan another brand
              </button>
            )}
            <Micro className="text-[#CBD0AC]">{status}</Micro>
          </span>
        </div>

        <div ref={topRef} className="mt-3 scroll-mt-24">
          {stage === 'setup' && (
            <>
              {error && (
                <div className="mb-3 rounded-lg border border-rose-300/40 bg-rose-950/30 px-4 py-3">
                  <p className="text-[13px] font-medium leading-relaxed text-rose-100">{error}</p>
                </div>
              )}
              <ScanSetup onStart={start} />
            </>
          )}

          {stage === 'scanning' && <ScanProgress session={session} brand={brand} />}

          {stage === 'results' && session.phase1 && (
            <ScanResults phase1={session.phase1} onUnlock={unlock} unlocking={unlocking} error={error} />
          )}

          {stage === 'report' && session.phase1 && session.phase2 && (
            <FullReport phase1={session.phase1} phase2={session.phase2} />
          )}
        </div>

        <Limits />
      </div>
    </section>
  );
}

/**
 * The honesty strip, kept on the tool itself.
 *
 * The full method lives on its own page now, because six sections of
 * explanation under a working console made the page read as a brochure about a
 * tool rather than as the tool. But the limits are not explanation — they are
 * part of the reading. Someone who runs a scan and walks away with a number
 * should have seen what the number does not cover, without having to click
 * through to find out.
 */
function Limits() {
  return (
    <div className="mt-10 border-t border-[#E7ECD9]/15 pt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Micro className="text-[#CBD0AC]">What this cannot tell you</Micro>
        <a
          href={`${BASE}/thallo-ai/method/`}
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#CBD0AC] underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Read the full method →
        </a>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3.5 sm:grid-cols-2">
        {LIMITS.map((l) => (
          <li key={l} className="flex items-start gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#55672E]" />
            <span className="text-[12px] font-medium leading-relaxed text-[#CBD0AC]">{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Shown whenever the figures are not measurements.
 *
 * Two ways that happens, and for a while this only covered the first:
 *
 *   · no backend is configured at all, so the browser is generating samples;
 *   · a backend IS configured and is itself returning samples, because no model
 *     key has been saved on it yet.
 *
 * The second case is the dangerous one and it shipped live for an hour. Wiring
 * the API URL made the banner disappear while the server was still answering
 * with invented numbers — a page full of figures and nothing saying they were
 * fiction, which is precisely the failure the tool this replaced was built on.
 *
 * `session.demo` comes from the server on every response, and the server is the
 * only thing that knows whether a key was actually used. Trusting the client's
 * own configuration to answer that question was the mistake.
 */
function DemoNotice({ configured }: { configured: boolean }) {
  return (
    <div className="mt-8 flex items-start gap-3 rounded-lg border border-[#CBD0AC]/40 bg-[#171A10]/50 px-4 py-3.5">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CBD0AC"
        strokeWidth="2.4"
        className="mt-0.5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3.5v.5" />
      </svg>
      <p className="text-[13px] font-medium leading-relaxed text-[#E7ECD9]">
        <strong className="font-bold text-white">Preview mode.</strong>{' '}
        {configured
          ? 'The scanner is reachable but has no model key saved yet, so it is returning sample data.'
          : 'The model APIs are not connected yet, so the figures below are sample data used to build and review the interface.'}{' '}
        Nothing here is a real measurement.
      </p>
    </div>
  );
}
