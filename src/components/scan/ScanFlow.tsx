'use client';

import React, { useCallback, useRef, useState } from 'react';
import { SplitReveal, scrollToEl } from '@/components/motion';
import ScanSetup from './ScanSetup';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';
import ReportConsole from './ReportConsole';
import { GROUND, Micro, Stepper, Tag } from './ui';
import { IS_LIVE, initialSession, startScan, unlockScan } from '@/lib/scan/engine';
import { marketLabel } from '@/lib/scan/markets';
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
  const sectionRef = useRef<HTMLElement>(null);

  /* Each stage is a full screen change, so put the reader at the top of it —
     but only on a change, never on a tick, or the page would fight the scroll
     every 400ms while a scan is running.

     Through `scrollToEl`, which drives Lenis, rather than through the browser's
     own `scrollIntoView`. This site runs Lenis smooth scroll, and Lenis writes
     `window.scrollTo` from its rAF loop on every single frame — so a native
     scroll is overwritten about 16ms after it is issued. The stage changes were
     therefore not scrolling at all: submit the form from halfway down the setup
     card and the scanning screen appeared with the viewport still parked where
     the button had been. Verified in the console — `window.scrollTo(0, 500)`
     leaves `scrollY` at 0 while Lenis is running.

     The whole section, not the panel below the masthead: the step rail lives up
     there and a stage change is exactly when it has something new to say. */
  const goto = useCallback((next: Stage) => {
    setStage(next);
    requestAnimationFrame(() => {
      if (sectionRef.current) scrollToEl(sectionRef.current, 0);
    });
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

  /* Step 2 is a taller card on a completely different layout — the photograph
     goes, the spread collapses to one column — so leaving the viewport where it
     was drops the reader into the middle of a screen that has just been rebuilt
     under them. Same treatment as a stage change, for the same reason. */
  const changeStep = useCallback(
    (next: 1 | 2) => {
      setSetupStep(next);
      requestAnimationFrame(() => {
        if (sectionRef.current) scrollToEl(sectionRef.current, 0);
      });
    },
    []
  );

  const brand = session.phase1?.brand ?? pending?.brand ?? 'your brand';
  /* The server's list once it has one — it is authoritative about what was
     actually sent — and the list the visitor just submitted before that. */
  const asked = session.phase1?.questions.length ?? pending?.questions.length ?? 0;

  /** Where the rail says we are. The setup card owns 1 and 2; 3 and 4 are ours. */
  const step: 1 | 2 | 3 | 4 = stage === 'setup' ? setupStep : stage === 'scanning' ? 3 : 4;

  /* The facts the setup card collected, kept on screen after its fields are
     gone. Read from the server's copy when there is one, because that is what
     was actually measured. */
  const run = session.phase1 ?? pending;
  const industry = session.phase1?.industry ?? pending?.industry;
  const market = session.phase1?.market ?? pending?.market;

  return (
    /* pt-24 on both branches. The bar's bottom edge is at 86px on a desktop
       and 74px below `sm`, so 96px of padding leaves the step rail about 10px
       of clearance and the whole flow sits that much closer to the navigation —
       which is what it was asked for. It is a small move on purpose: the rail
       still has air above it, it simply no longer has a hand's width of it.

       The comment that used to be here claimed `pt-32`, and the code has said
       `pt-28` for some time. */
    /* On the first step the section is at least a full screen and centres what
       is in it, so the photograph runs to the bottom edge instead of stopping
       38px short and leaving a strip of the page showing under it. Only there:
       the later stages are taller than a screen anyway and a minimum would do
       nothing but add dead space.

       That first step also gets its own, much smaller padding, and no `2xl`
       bump. `2xl` is a WIDTH breakpoint, so a wide-but-short window — 1854×935
       is an ordinary laptop with the browser chrome on — was being given the
       160/96 padding meant for a tall one. That is 256px, a quarter of the
       screen, spent on air: the first step needed 1021px to draw 765px of
       content, so it overflowed by 86 and put a scrollbar on a screen with
       essentially nowhere to go. The padding does nothing here anyway —
       `justify-center` is already distributing the spare height — it only has
       to clear the floating navbar at the top. */
    <section
      ref={sectionRef}
      id="tool"
      className={`relative isolate overflow-hidden bg-[#F8FAF7] ${
        hero ? 'pt-24 pb-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-center' : 'pt-24 pb-16 2xl:pt-28 2xl:pb-24'
      }`}
      style={hero ? undefined : GROUND}
    >
      {/* The photograph used to stand behind the first step and nowhere else,
          on the reasoning that a picture behind two thousand pixels of table is
          a picture nobody looks at. That reasoning holds for the table and not
          for the masthead — and dropping it outright is what made every stage
          after the first read as a different, plainer product.

          So it stays on all of them, as a band under the heading rather than a
          full-bleed backdrop: at 520px it covers the masthead and nothing else,
          and it is masked out at the bottom instead of being faded into a flat
          colour, so the olive ground and its plotting grid come through
          underneath exactly as before. The first step still gets the whole
          frame, because there the picture *is* the screen. */}
      {hero ? (
        <>
          <img
            src={`${BASE}/contact-bg.webp`}
            alt=""
            aria-hidden="true"
            data-print="hide"
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
            data-print="hide"
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(to right, rgba(23,26,16,.88) 0%, rgba(23,26,16,.66) 42%, rgba(23,26,16,.5) 100%)' }}
          />
        </>
      ) : (
        <>
          {/* 300 rather than 520: the band was sized to cover a masthead that
              these stages no longer carry. All that is left above the white
              card is the step rail, and a band running 200px past it put a
              photograph behind the top third of a panel that is opaque anyway
              — visible only as a dark rim down either side of it. */}
          <div
            aria-hidden
            data-print="hide"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] select-none overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%)',
            }}
          >
            <img
              src={`${BASE}/contact-bg.webp`}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="h-full w-full object-cover object-[68%_center]"
            />
            {/* The same two passes the first step uses, so the white type sits
                on the same weight of ground wherever you are in the flow. */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(23,26,16,.88) 0%, rgba(23,26,16,.66) 42%, rgba(23,26,16,.5) 100%)' }}
            />
          </div>
        </>
      )}

      {/* `w-full` because the section is a flex column on the first step, and a
          flex child sizes to its content rather than its parent. */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6">
        {/* ── The rail ───────────────────────────────────────────────────────
            Full width and above everything, on every stage including the first.

            It is here rather than inside each stage's own masthead for the
            reason it exists at all: a scan is one sequence of four screens, and
            a marker that only appears once you are three screens in is a marker
            that never told you the sequence existed. Full width also sidesteps
            the layout problem — four steps do not fit in the 500px column the
            first step's heading occupies. */}
        {/* Where you are in a four-screen sequence — which a printed report
            is not in. The tags beside it say the brand, the category and the
            market, and all three are printed inside the report anyway. */}
        <div
          data-print="hide"
          className="mb-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-white/15 pb-4"
        >
          <Stepper current={step} />
          {run && industry && market ? (
            <div className="flex flex-wrap items-center gap-2">
              <Tag>{run.brand}</Tag>
              <Tag>{industry}</Tag>
              <Tag>{marketLabel(market)}</Tag>
            </div>
          ) : (
            <span className="hidden rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-bold text-white sm:block">
              Free scan
            </span>
          )}
        </div>

        {/* The heading lives on the first step and nowhere else.
            "Check your AI visibility." and the line under it are the page
            introducing itself, and a visitor on step 2 has read that
            introduction, acted on it and is now three fields deep into the
            thing it was introducing. Repeating it over every stage was 200px of
            masthead spent telling somebody what they are already doing — and it
            pushed the actual work down the screen on all four screens.

            What replaces it is the rail directly above: on step 2 the answer to
            "where am I" is "2 of 4, Your questions", which the rail already
            says, and each stage's own panel carries its own `Head`. */}

        {/* On the first step this rides in the left column instead — see below.
            Full width there, it was 83px of banner plus 32px of margin stacked
            above a screen that was already 86px too tall, and the left column
            has room going spare beside a 589px card. */}
        {!hero && (!IS_LIVE || session.demo) && <DemoNotice configured={IS_LIVE} />}

        {/* No top margin any more: the rail's own `mb-9` used to be separating
            it from a masthead, and with that gone the two margins stacked into
            72px of nothing between the rail and the card under it. */}
        <div>
          {stage === 'setup' && (
            <>
              {error && (
                <div className="mb-3 rounded-xl border border-rose-300/40 bg-rose-950/30 px-4 py-3.5">
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
                    <Masthead />
                    {(!IS_LIVE || session.demo) && <DemoNotice configured={IS_LIVE} />}
                  </div>
                )}

                <ScanSetup key="setup" onStart={start} onStepChange={changeStep} />
              </div>
            </>
          )}

          {stage === 'scanning' && (
            <ScanProgress
              session={session}
              brand={brand}
              asked={asked}
              questions={session.phase1?.questions ?? pending?.questions ?? []}
            />
          )}

          {stage === 'results' && session.phase1 && (
            <ScanResults phase1={session.phase1} onUnlock={unlock} unlocking={unlocking} error={error} />
          )}

          {stage === 'report' && session.phase1 && session.phase2 && (
            <ReportConsole phase1={session.phase1} phase2={session.phase2} />
          )}
        </div>

      </div>
    </section>
  );
}

/**
 * The heading block. The first step only.
 *
 * It once existed twice — as the left column of the first step's spread and as
 * a masthead over every other stage — and then as one definition rendered on
 * all four. Both are gone: a heading that says what the page is belongs on the
 * screen where the page is still introducing itself, and repeating it over the
 * questions, the progress list and the report was asking a reader who is
 * already inside the tool to walk past its front door again on every screen.
 *
 * The h1 therefore renders once, on the stage a visitor lands on, which is also
 * the stage the prerendered HTML shows — so the document still has exactly one
 * heading and a crawler still finds it.
 */
function Masthead() {
  return (
    <div>
      <Micro className="text-[#CBD0AC]">Scan</Micro>
      <SplitReveal
        as="h1"
        scroll={false}
        fade={false}
        className="mt-4 max-w-[14ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
        html="Check your AI visibility."
      />
      <p className="mt-5 max-w-[52ch] text-[15px] font-medium leading-relaxed text-white/75">
        Ask the models what they say about you, in your own words. Free, no account, under a minute.
      </p>
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
    <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#CBD0AC]/40 bg-[#171A10]/50 px-4 py-3.5">
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
