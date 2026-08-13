'use client';

import React, { useCallback, useRef, useState } from 'react';
import { SplitReveal } from '@/components/motion';
import ScanSetup from './ScanSetup';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';
import FullReport from './FullReport';
import { GRID, GROUND, Micro } from './ui';
import { IS_LIVE, initialSession, startScan, unlockScan } from '@/lib/scan/engine';
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

  /* Which half of the setup is showing. Only the first step gets the
     photograph and the two-column spread — see the note on the <img> below. */
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const hero = stage === 'setup' && setupStep === 1;

  const brand = session.phase1?.brand ?? pending?.brand ?? 'your brand';
  /* The server's list once it has one — it is authoritative about what was
     actually sent — and the list the visitor just submitted before that. */
  const asked = session.phase1?.questions.length ?? pending?.questions.length ?? 0;

  return (
    /* pt-32 rather than pt-28: the label above the heading is gone, and at the
       old padding the h1 came within 26px of the floating navbar. */
    /* On the first step the section is at least a full screen and centres what
       is in it, so the photograph runs to the bottom edge instead of stopping
       38px short and leaving a strip of the page showing under it. Only there:
       the later stages are taller than a screen anyway and a minimum would do
       nothing but add dead space. */
    <section
      id="tool"
      className={`relative isolate overflow-hidden bg-[#F8FAF7] pt-32 pb-16 2xl:pt-40 2xl:pb-24 ${
        hero ? 'lg:flex lg:min-h-screen lg:flex-col lg:justify-center' : ''
      }`}
      style={hero ? undefined : GROUND}
    >
      {/* The photograph only stands behind the first step. Everything after it
          — the progress list, the results, the report — is long, dense and
          scrolls, and a picture behind two thousand pixels of table is a
          picture nobody is looking at. Those keep the olive ground and its
          plotting grid, which is the tool's own language. */}
      {hero ? (
        <>
          <img
            src={`${BASE}/contact-bg.webp`}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full select-none object-cover object-[68%_center]"
          />
          {/* Two passes. The horizontal one holds the heading down over the
              left of the frame, where the wall is at its brightest; the flat
              one underneath keeps the whole picture from competing with a white
              card sitting on it. The isotipo on that wall is the reason the
              left pass stops short of opaque — it should still be visible
              behind the words. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(to right, rgba(23,26,16,.88) 0%, rgba(23,26,16,.66) 42%, rgba(23,26,16,.5) 100%)' }}
          />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />
      )}

      {/* `w-full` because the section is a flex column on the first step, and a
          flex child sizes to its content rather than its parent. */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6">
        {/* Outside the flow on purpose — the prerendered HTML still says what
            this page is, whatever the console resolves to.

            An h2, not an h1: the presentation above owns the page's heading
            now. Two h1s would have left the document with no single answer to
            "what is this page", on a page whose whole subject is being legible
            to machines. */}
        {/* On the first step the heading is the left half of a spread and the
            form is the right, so it belongs inside that grid. Everywhere else
            it is a masthead over whatever the stage is showing. */}
        {!hero && (
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
            <span className="hidden rounded-full bg-[#39471D]/10 px-3 py-1.5 text-[11px] font-bold text-[#39471D] sm:block">Free scan</span>
          </div>
        )}

        {(!IS_LIVE || session.demo) && <DemoNotice configured={IS_LIVE} />}

        <div ref={topRef} className={`${hero ? '' : 'mt-8'} scroll-mt-24`}>
          {stage === 'setup' && (
            <>
              {error && (
                <div className="mb-3 rounded-lg border border-rose-300/40 bg-rose-950/30 px-4 py-3">
                  <p className="text-[13px] font-medium leading-relaxed text-rose-100">{error}</p>
                </div>
              )}

              {/* One tree, not a ternary with a <ScanSetup> in each arm. Two
                  arms are two positions as far as React is concerned, so the
                  moment `hero` flipped it unmounted one instance and mounted a
                  fresh one — which reset the step to 1 the instant the step
                  changed to 2, and the form bounced straight back. The keys are
                  what let the left column appear and disappear without the form
                  beside it being treated as a different element. */}
              <div
                className={
                  /* `items-end`, not `items-center`. The heading is shorter
                     than the form beside it, and centred it floated 188px above
                     the card's bottom edge with nothing under it. Sitting both
                     on the same line gives the spread a floor. */
                  hero
                    ? 'grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16'
                    : ''
                }
              >
                {hero && (
                  <div key="intro">
                    <Micro className="text-[#CBD0AC]">Scan</Micro>
                    <SplitReveal
                      as="h1"
                      scroll={false}
                      fade={false}
                      className="mt-4 max-w-[14ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
                      html="Check your AI visibility."
                    />
                    <p className="mt-5 max-w-[46ch] text-[15px] font-medium leading-relaxed text-white/75">
                      Ask the models what they say about you, in your own words. Free, no account, under a minute.
                    </p>
                  </div>
                )}

                <ScanSetup key="setup" onStart={start} onStepChange={setSetupStep} />
              </div>
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
