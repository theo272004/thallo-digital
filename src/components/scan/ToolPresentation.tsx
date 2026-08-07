'use client';

import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { QUESTION_COUNT } from '@/lib/scan/questions';
import { scrollToEl } from '@/components/motion';

/**
 * The opening of the tool page: a self-playing demonstration of the report,
 * sitting beside the button that produces a real one.
 *
 * ## Why this replaced the old opening
 *
 * The page used to begin on the form. That is efficient for somebody who
 * already knows what this is, and opaque to everybody else — three input fields
 * and a submit button, with no way to find out what pressing it produces. The
 * explanation lived on a second page, which nobody reads before deciding.
 *
 * So the product demonstrates itself. The panel cycles through the five screens
 * the real report is made of while you read the sentence next to it; by the time
 * anyone reaches the console they already know what they are about to get.
 *
 * ## Why it plays itself, and why it stops
 *
 * It advances on a timer because the point is that you do not have to do
 * anything — the page shows you the product the way a demo would, without
 * asking for a domain first. But an animation that cannot be stopped is an
 * animation that cannot be read: it pauses on hover and on keyboard focus, and
 * the rail underneath is a real set of buttons, so anyone who wants to sit on
 * one frame can. Under `prefers-reduced-motion` nothing advances on its own at
 * all and the rail is the only way through, which is the correct behaviour
 * rather than a degraded one.
 *
 * ## The figures on it are fixed and labelled
 *
 * Every number in here is a constant, and the panel is captioned DEMO
 * throughout. This tool's entire proposition is that it does not invent
 * numbers; a marketing surface that invented some would cost more than it
 * earned. Nothing here is generated, derived from the visitor, or presented as
 * a measurement.
 */

const FRAME_MS = 5200;

/* ── Tokens ──────────────────────────────────────────────────────────────── */

const INK = '#171A10';
const OLIVE = '#39471D';
const HAIR = 'rgba(23,26,16,0.09)';

const Micro = ({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${className}`} style={style}>
    {children}
  </span>
);

/**
 * Whether this visitor has asked their system to stop moving things.
 *
 * Subscribed rather than read once, so switching the setting takes effect
 * without a reload, and read through `useSyncExternalStore` so the server and
 * the first client paint agree: the server snapshot is `true` — no motion —
 * which means the pre-rendered HTML is the still, readable version and the
 * panel only ever starts playing after hydration has confirmed it should.
 */
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(QUERY).matches,
    () => true
  );
}

/** A readout row: label, hairline bar, figure. The panel's only chart idiom. */
function Row({ label, value, pct, muted = false }: { label: string; value: string; pct: number; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <span
        className={`w-[86px] shrink-0 truncate text-[12.5px] font-semibold ${muted ? 'text-gray-400' : 'text-gray-900'}`}
      >
        {label}
      </span>
      <span className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: muted ? '#D8DCC8' : OLIVE }}
        />
      </span>
      <span className="w-11 shrink-0 text-right font-mono text-[10.5px] font-bold tabular-nums text-gray-400">
        {value}
      </span>
    </div>
  );
}

/* ── The frames ──────────────────────────────────────────────────────────── */

type Frame = { id: string; tab: string; caption: string; body: string; view: React.ReactNode };

const FRAMES: Frame[] = [
  {
    id: 'questions',
    tab: 'Questions',
    caption: 'The questions your buyers actually type.',
    body: `${QUESTION_COUNT} of them, across five angles, in the language of the market you sell into. Your brand name is in none of them — a question that names you is a question that leads the answer.`,
    view: (
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 pb-5">
          <Micro className="text-gray-400">Sent verbatim</Micro>
          <Micro className="text-gray-400">Español · Colombia</Micro>
        </div>
        <ol className="flex flex-col gap-3.5">
          {[
            '¿Cuáles son las mejores empresas de fintech y pagos ahora mismo?',
            '¿Quiénes son los proveedores líderes en fintech y pagos?',
            '¿Cuáles son los proveedores más confiables en fintech y pagos?',
            'Si no estoy conforme con mi proveedor actual, ¿a quién debería cambiarme?',
          ].map((q, i) => (
            <li key={q} className="flex gap-3.5">
              <span className="font-mono text-[10.5px] font-bold tabular-nums text-gray-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span lang="es" className="text-[13px] font-medium leading-snug text-gray-700">
                {q}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t pt-4 text-[12px] font-medium text-gray-400" style={{ borderColor: HAIR }}>
          + {QUESTION_COUNT - 4} more, all shown with your result
        </p>
      </div>
    ),
  },
  {
    id: 'models',
    tab: 'Models',
    caption: 'Five machines, answering two different questions.',
    body: 'ChatGPT, Claude and Gemini answer from memory — did your industry talk about you enough that a model learned your name? Perplexity and Google AI Overview read the live web. A brand can pass one and fail the other, and the two have opposite fixes.',
    view: (
      <div className="p-6 sm:p-7">
        <Micro className="text-gray-400">From memory · web search off</Micro>
        <p className="mt-4 text-[16px] font-bold tracking-tight text-gray-900">ChatGPT · Claude · Gemini</p>
        <p className="mt-2 max-w-[42ch] text-[12.5px] font-medium leading-relaxed text-gray-500">
          Moves slowly. The harder one to fake.
        </p>
        <p className="mt-4 font-mono text-[10.5px] font-bold tracking-wide" style={{ color: OLIVE }}>
          {QUESTION_COUNT * 3} ANSWERS · FREE
        </p>

        <div className="my-6 border-t" style={{ borderColor: HAIR }} />

        <Micro className="text-gray-400">From live search · retrieval on</Micro>
        <p className="mt-4 text-[16px] font-bold tracking-tight text-gray-900">Perplexity · Google AI Overview</p>
        <p className="mt-2 max-w-[42ch] text-[12.5px] font-medium leading-relaxed text-gray-500">
          Moves fast. The one you can shift this quarter.
        </p>
      </div>
    ),
  },
  {
    id: 'score',
    tab: 'Result',
    caption: 'Named, or not named — and where you ranked.',
    body: 'Every answer is read for three things: whether it contains you, what position you held, and who else was in it. A model that lists you eighth is not recommending you, which is why rank sits beside the headline percentage rather than behind it.',
    view: (
      <div className="p-6 sm:p-7">
        <div className="flex items-end justify-between gap-6 border-b pb-6" style={{ borderColor: HAIR }}>
          <div>
            <Micro className="text-gray-400">Share of voice</Micro>
            <p className="mt-2.5 text-[52px] font-bold leading-[0.85] tracking-[-0.045em] text-gray-900">
              24<span className="text-[24px] text-gray-300">%</span>
            </p>
          </div>
          <div className="text-right">
            <Micro className="text-gray-400">Average rank</Micro>
            <p className="mt-2.5 font-mono text-[24px] font-bold leading-none tabular-nums" style={{ color: OLIVE }}>
              3.8
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Row label="ChatGPT" value="2/15" pct={13} />
          <Row label="Claude" value="5/15" pct={33} />
          <Row label="Gemini" value="4/15" pct={27} />
        </div>
      </div>
    ),
  },
  {
    id: 'rivals',
    tab: 'Rivals',
    caption: 'And the companies named in your place.',
    body: 'Every other business the models mentioned, tallied across all forty-five answers. This is usually the part that changes the conversation internally — not the score, but the list of who is holding the position you wanted.',
    view: (
      <div className="p-6 sm:p-7">
        <Micro className="text-gray-400">Recommended instead of you</Micro>
        <div className="mt-6 flex flex-col gap-4">
          <Row label="Northwind" value="13" pct={100} muted />
          <Row label="Sable &amp; Co" value="12" pct={92} muted />
          <Row label="Vertex" value="10" pct={77} muted />
          <Row label="You" value="11" pct={85} />
          <Row label="Kestrel" value="7" pct={54} muted />
        </div>
      </div>
    ),
  },
  {
    id: 'plan',
    tab: 'Plan',
    caption: 'Then what to do about it, in order.',
    body: 'A hundred points checked live against your own site — crawler access, citations, schema, freshness — with every point traced to the row that earned it. The plan is ordered by what the scan found, so the first item is the one actually holding you back.',
    view: (
      <div className="p-6 sm:p-7">
        <Micro className="text-gray-400">Technical readiness · 43 / 100</Micro>
        <ul className="mt-5 flex flex-col">
          {[
            ['AI crawlers allowed in robots.txt', '25 pts', true],
            ['Cited on third-party authority sites', '25 pts', false],
            ['Organization schema markup', '15 pts', false],
            ['Content published in the last 6 months', '10 pts', true],
            ['Structured FAQ schema', '10 pts', false],
          ].map(([label, pts, ok]) => (
            <li
              key={label as string}
              className="flex items-center gap-3.5 border-b py-3 last:border-0"
              style={{ borderColor: HAIR }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: ok ? OLIVE : '#D8DCC8' }}
              />
              <span className="min-w-0 flex-1 text-[12.5px] font-medium text-gray-700">{label as string}</span>
              <span className="font-mono text-[10.5px] font-bold tabular-nums text-gray-400">{pts as string}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
];

/* ── The component ───────────────────────────────────────────────────────── */

export default function ToolPresentation() {
  const [index, setIndex] = useState(0);
  /* Hovering suspends the clock; clicking stops it for good. They are separate
     because they mean different things and should look different. A hover is
     "wait, let me read this" — the bar freezes where it is and carries on when
     the pointer leaves. A click is "I will drive" — the bar goes solid, and the
     panel never takes the wheel back, because a demo that resumes after
     somebody has chosen a frame is a demo arguing with its reader. */
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const quiet = useReducedMotion();

  /* There is no timer. The progress bar's own CSS animation is the clock, and
     the frame advances when it ends — so the bar can never disagree with the
     thing it is reporting on, and pausing is exact rather than approximately
     exact. A `setTimeout` alongside a CSS animation is two clocks that drift
     the moment the tab is backgrounded. */
  const advance = useCallback(() => setIndex((i) => (i + 1) % FRAMES.length), []);

  /* A click is a decision to look at that frame, so it also stops the panel
     moving out from under the person who made it. */
  const select = useCallback((i: number) => {
    setIndex(i);
    setHeld(true);
  }, []);

  const frame = FRAMES[index];
  /** Is the clock mounted and counting for the current frame? */
  const running = !quiet && !held;

  return (
    <section className="relative isolate overflow-hidden bg-white pt-32 pb-20 sm:pt-36 2xl:pt-44">
      {/* One very soft wash, top-right. The page is otherwise white — the panel
          is the only thing with weight, which is the whole idea. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(72% 52% at 88% 0%, rgba(231,236,217,0.62) 0%, rgba(255,255,255,0) 68%)',
        }}
      />

      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,46ch)_minmax(0,1fr)] lg:gap-20">
          {/* ── Left: the pitch ─────────────────────────────────────────── */}
          <div>
            <Micro style={{ color: OLIVE }} className="opacity-70">
              Free · no account
            </Micro>

            <h1
              className="mt-7 font-sans font-bold text-gray-900"
              style={{ fontSize: 'clamp(2.5rem, 4.6vw, 4.1rem)', lineHeight: 0.98, letterSpacing: '-0.042em' }}
            >
              Ask the machines what they say about you.
            </h1>

            <p className="mt-7 max-w-[48ch] text-[15px] font-medium leading-relaxed text-gray-500">
              We put {QUESTION_COUNT} real buying questions to ChatGPT, Claude and Gemini and count how often your name
              comes up. Your brand is never in the question, and you see every question and every answer.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={() => scrollToEl('#tool', -90)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors"
                style={{ backgroundColor: INK }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = OLIVE)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = INK)}
              >
                Run the scan
              </button>
              <span className="text-[12px] font-medium text-gray-400">Takes about a minute</span>
            </div>

            {/* The caption belongs to the frame, so it changes with it. Kept in
                the reading column rather than on the panel: the panel is the
                product, and product surfaces do not narrate themselves. */}
            <div className="mt-12 border-t pt-7" style={{ borderColor: HAIR }} aria-live="polite">
              <p className="text-[19px] font-bold leading-snug tracking-[-0.02em] text-gray-900">{frame.caption}</p>
              <p className="mt-3 max-w-[46ch] text-[13.5px] font-medium leading-relaxed text-gray-500">{frame.body}</p>
            </div>
          </div>

          {/* ── Right: the demo ─────────────────────────────────────────── */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            /* Keyboard focus holds it outright rather than merely pausing:
               somebody tabbing through the rail is reading, and a panel that
               resumed the moment focus moved on would move under them. */
            onFocusCapture={() => setHeld(true)}
          >
            <div
              className="overflow-hidden rounded-[20px] border bg-white"
              style={{ borderColor: HAIR, boxShadow: '0 40px 80px -48px rgba(23,26,16,0.42)' }}
            >
              {/* Panel chrome. Says "tool", and says DEMO, in the same strip. */}
              <div
                className="flex items-center justify-between gap-3 border-b px-5 py-3"
                style={{ borderColor: HAIR }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: OLIVE }} />
                  <Micro className="text-gray-400">Visibility report</Micro>
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-gray-500"
                  style={{ background: '#F2F4EC' }}
                >
                  Demo
                </span>
              </div>

              {/* Fixed height so the panel never resizes between frames — a
                  demo that jumps by 80px each time it advances reads as a bug
                  rather than as a product. */}
              <div className="relative h-[382px] sm:h-[400px]">
                {FRAMES.map((f, i) => (
                  <div
                    key={f.id}
                    aria-hidden={i !== index}
                    className="absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out"
                    style={{
                      opacity: i === index ? 1 : 0,
                      pointerEvents: i === index ? 'auto' : 'none',
                    }}
                  >
                    {f.view}
                  </div>
                ))}
              </div>
            </div>

            {/* The rail — real buttons, and the progress readout.
                A five-column grid rather than a wrapping flex row: five equal
                tracks always fit, where `flex-wrap` dropped the last tab onto
                its own line at 375px and `flex-1` then stretched it across the
                full width, which read as a bug. */}
            <ul className="mt-5 grid grid-cols-5 gap-x-2">
              {FRAMES.map((f, i) => (
                <li key={f.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={i === index}
                    className="group block w-full text-left"
                  >
                    <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-gray-100">
                      {i === index && running ? (
                        /* The clock. Keyed on the index so it restarts from
                           zero each time this frame comes round, frozen in
                           place by `animation-play-state` on hover, and it is
                           its own end event that advances the panel. */
                        <span
                          key={`run-${index}`}
                          onAnimationEnd={advance}
                          className="absolute inset-y-0 left-0 w-0 rounded-full"
                          style={{
                            background: OLIVE,
                            animation: `frame-fill ${FRAME_MS}ms linear forwards`,
                            animationPlayState: hovered ? 'paused' : 'running',
                          }}
                        />
                      ) : (
                        /* Seen frames sit full and faded; unseen ones empty.
                           When the clock is not mounted at all — motion off, or
                           a frame chosen by hand — the current one reads solid,
                           because there is no countdown to misrepresent. */
                        <span
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            background: OLIVE,
                            width: i <= index ? '100%' : '0%',
                            opacity: i === index ? 1 : i < index ? 0.28 : 0,
                          }}
                        />
                      )}
                    </span>
                    {/* Five labels do not fit across a phone at a legible
                        size, and shrinking them until they do is how a premium
                        surface starts looking cheap. Below `sm` the bars carry
                        the position on their own and the name of the current
                        frame is stated once, underneath. */}
                    <span
                      className={`mt-2.5 hidden text-[10px] font-bold uppercase tracking-[0.16em] transition-colors sm:block ${
                        i === index ? 'text-gray-900' : 'text-gray-300 group-hover:text-gray-500'
                      }`}
                    >
                      {f.tab}
                    </span>
                    <span className="sr-only">{f.tab}</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-3 flex items-baseline gap-2 sm:hidden" aria-hidden>
              <span className="font-mono text-[10px] font-bold tabular-nums text-gray-300">
                {String(index + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')}
              </span>
              <Micro className="text-gray-900">{frame.tab}</Micro>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
