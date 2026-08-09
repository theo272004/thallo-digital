'use client';

import React, { useCallback, useRef, useState } from 'react';
import { SplitReveal } from '@/components/motion';
import ScanSetup from './ScanSetup';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';
import FullReport from './FullReport';
import { GRID, GROUND, Micro } from './ui';
import { IS_LIVE, initialSession, startScan, unlockScan } from '@/lib/scan/engine';
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
      /* When the address was given on the setup screen the server ran the whole
         thing in one go, so there is no gate to show — going to 'results' would
         park a finished report behind a form asking for an email we already
         have. The two-step flow still lands on 'results', which is where it
         asks. */
      goto(done.phase2 ? 'report' : 'results');
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

  const brand = session.phase1?.brand ?? pending?.brand ?? 'your brand';
  /* The server's list once it has one — it is authoritative about what was
     actually sent — and the list the visitor just submitted before that. */
  const asked = session.phase1?.questions.length ?? pending?.questions.length ?? 0;

  return (
    /* pt-32 rather than pt-28: the label above the heading is gone, and at the
       old padding the h1 came within 26px of the floating navbar. */
    <section id="tool" className="relative isolate overflow-hidden bg-[#F8FAF7] pt-32 pb-16 2xl:pt-40 2xl:pb-24" style={GROUND}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />

      <div className="relative mx-auto max-w-[1440px] px-6">
        {/* Outside the flow on purpose — the prerendered HTML still says what
            this page is, whatever the console resolves to.

            An h2, not an h1: the presentation above owns the page's heading
            now. Two h1s would have left the document with no single answer to
            "what is this page", on a page whose whole subject is being legible
            to machines. */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <Micro className="text-[#CBD0AC]">Scan</Micro>
            <SplitReveal
              as="h1"
              scroll={false}
              fade={false}
              className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
              html="Check your AI visibility."
            />
          </div>
          <span className="hidden rounded-full bg-[#F0F4E7] px-3 py-1.5 text-[11px] font-bold text-[#617A2B] sm:block">Free scan</span>
        </div>

        {(!IS_LIVE || session.demo) && <DemoNotice configured={IS_LIVE} />}

        {/* Panel chrome — the strip a tool wears and a brochure does not. */}
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

          {stage === 'scanning' && <ScanProgress session={session} brand={brand} asked={asked} />}

          {stage === 'results' && session.phase1 && (
            <ScanResults phase1={session.phase1} onUnlock={unlock} unlocking={unlocking} error={error} />
          )}

          {stage === 'report' && session.phase1 && session.phase2 && (
            <FullReport phase1={session.phase1} phase2={session.phase2} />
          )}
        </div>

      </div>
    </section>
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
