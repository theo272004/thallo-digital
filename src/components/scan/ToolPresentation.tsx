'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { QUESTION_COUNT } from '@/lib/scan/questions';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { BASE } from '@/lib/site';

/**
 * The opening of the tool page: one continuous camera move across the report,
 * scrubbed to the scroll.
 *
 * ## What this is
 *
 * Every surface the scan produces is laid out once, at fixed coordinates, on a
 * single board 2400 × 1500 design units across. Nothing enters or leaves. What
 * moves is the camera — it flies between the six cards, diving in close for a
 * number and pulling back to take in a whole panel — and inside each card its
 * own contents animate as the camera arrives: questions type, model rows
 * resolve, bars fill, a line draws, a readout travels along it.
 *
 * It ends by pulling all the way back so the whole board is visible at once.
 * That last shot is the argument: this is everything the scan gives you, and
 * you have just watched it being made.
 *
 * ## Why a board and a camera, rather than slides
 *
 * Slides cut. A cut tells you nothing about how two things relate. Because the
 * cards here occupy real positions in one space, the move between them carries
 * meaning — the questions sit to the left of the models that answer them, the
 * score sits beyond those, and the trend is the far corner you arrive at last.
 * Somebody who watches it once knows the shape of the product.
 *
 * ## How the camera works
 *
 * `shot(cx, cy, zoom)` frames the design-space point `(cx, cy)` in the middle of
 * the stage. The board is transformed from its top-left corner, so the maths is
 * exact and needs no measuring:
 *
 *     k = fit × zoom                 // design units → CSS pixels
 *     x = stageWidth  / 2 − cx × k
 *     y = stageHeight / 2 − cy × k
 *
 * `fit` maps a ~1120 × 720 design-unit window onto the stage, so a zoom of 1
 * frames roughly one card. It is recomputed on every ScrollTrigger refresh, and
 * every tween reads it through a function, so a resize re-frames rather than
 * drifting.
 *
 * The stage is CSS `position: sticky` rather than a GSAP pin: pinning inserts a
 * spacer and re-measures constantly, which fights the Lenis smooth scroll this
 * site runs, while sticky is handled by the browser's own compositor and cannot
 * desynchronise.
 *
 * ## Every figure here is a constant
 *
 * The board is captioned DEMO throughout and nothing on it is computed, derived
 * from the visitor, or presented as a measurement. A tool whose whole
 * proposition is that it does not invent numbers cannot have an opening that
 * invents some.
 *
 * ## Reduced motion
 *
 * A different layout, not a degraded one: the board unstacks into a plain list
 * of cards, the camera never exists, and no timeline is built at all.
 */

/* ── Design space ────────────────────────────────────────────────────────── */

const BOARD_W = 2400;
const BOARD_H = 1500;

/**
 * How much of the stage a shot fills.
 *
 * Expressed as a share of the frame rather than as a zoom multiplier, because a
 * multiplier lands a 420-unit card and a 900-unit one at completely different
 * apparent sizes. Asking every shot to occupy the same share of the frame is
 * what actually keeps them consistent.
 *
 * A card fills a little over half. It is deliberately not more: leaving air
 * around it keeps the neighbouring cards on screen, so you can still see where
 * in the report you are — the reason the establishing shot exists at all.
 */
const CARD_FILL = 0.64;
const BOARD_FILL = 0.9;

/**
 * The ceiling on design units → pixels.
 *
 * Without it, the narrow cards get enlarged until they fill their share of the
 * frame and their type becomes enormous purely because they had room to grow.
 * With it, body text lands between about 16 and 18 pixels on a laptop wherever
 * the camera stops.
 */
const MAX_SCALE = 0.95;

const OLIVE = '#39471D';
const MID = '#55672E';
const HAIR = 'rgba(23,26,16,0.10)';

type Card = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** True when the stacked layout needs a different arrangement, not just a
      different width. Only the three-column models card does. */
  stacksNarrow?: boolean;
};

/**
 * Where each card sits, and what the camera is looking at when it is that
 * card's turn. Authored by hand rather than measured: these positions are the
 * composition, and a layout that measured itself would let a copy edit quietly
 * restage the film.
 */
const CARDS: Card[] = [
  { id: 'questions', label: 'The questions', x: 90, y: 150, w: 660, h: 620 },
  /* The only card whose arrangement changes when stacked. Three columns is the
     right composition for the camera and the wrong one for a phone, where it
     becomes one. */
  { id: 'models', label: 'The models', x: 880, y: 190, w: 900, h: 540, stacksNarrow: true },
  { id: 'score', label: 'Your share of voice', x: 1900, y: 170, w: 420, h: 580 },
  { id: 'rivals', label: 'Named instead of you', x: 150, y: 900, w: 700, h: 470 },
  { id: 'signals', label: 'Your own site', x: 980, y: 880, w: 720, h: 510 },
  { id: 'trend', label: 'Month after month', x: 1830, y: 900, w: 500, h: 470 },
];

const cardById = (id: string) => CARDS.find((c) => c.id === id)!;

/**
 * The box the six cards actually occupy.
 *
 * The establishing shot frames this rather than the full 2400 × 1500 board.
 * The board is bigger than its contents — the cards sit 150 units below its top
 * edge and 80 short of its right one — and framing all that empty space pushed
 * the whole composition down the screen and away from the heading above it.
 * Derived rather than written down, so moving a card re-frames the shot instead
 * of quietly leaving a margin behind.
 */
const BOUNDS = (() => {
  const x0 = Math.min(...CARDS.map((c) => c.x));
  const y0 = Math.min(...CARDS.map((c) => c.y));
  const x1 = Math.max(...CARDS.map((c) => c.x + c.w));
  const y1 = Math.max(...CARDS.map((c) => c.y + c.h));
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
})();


/* ── Card chrome ─────────────────────────────────────────────────────────── */

const Micro = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <span className={`text-[13px] font-bold uppercase tracking-[0.2em] ${className}`} style={style}>
    {children}
  </span>
);

function Surface({ card, children }: { card: Card; children: React.ReactNode }) {
  return (
    <div
      data-card={card.id}
      className="absolute rounded-[18px] border bg-white"
      style={{
        left: card.x,
        top: card.y,
        width: card.w,
        height: card.h,
        borderColor: HAIR,
        boxShadow: '0 60px 120px -70px rgba(23,26,16,0.55)',
      }}
    >
      {children}
    </div>
  );
}

/* ── The board ───────────────────────────────────────────────────────────── */

/**
 * The six surfaces. Functions of one flag rather than plain nodes: a 900-unit
 * three-column card cannot be scaled down onto a phone and stay legible, so the
 * narrow layout is authored here beside the wide one rather than as a second
 * set of cards that would drift away from these.
 */
const CONTENT: Record<string, (narrow: boolean) => React.ReactNode> = {
  questions: () => (
        <div className="flex h-full flex-col p-9">
          <div className="flex items-baseline justify-between">
            <Micro className="text-gray-400">Sent verbatim</Micro>
            <Micro className="text-gray-400">Español · Colombia</Micro>
          </div>
          <ol className="mt-9 flex flex-col gap-6">
            {[
              '¿Cuáles son las mejores empresas de fintech y pagos ahora mismo?',
              '¿Quiénes son los proveedores líderes en fintech y pagos?',
              '¿Cuáles son los proveedores más confiables del sector?',
              'Si no estoy conforme con mi proveedor, ¿a quién debería cambiarme?',
            ].map((text, i) => (
              <li key={text} data-q className="flex gap-5">
                <span className="font-mono text-[15px] font-bold tabular-nums text-gray-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span lang="es" className="text-[19px] font-medium leading-snug text-gray-800">
                  {text}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-auto border-t pt-6 text-[16px] font-medium text-gray-400" style={{ borderColor: HAIR }}>
            + {QUESTION_COUNT - 4} more · your brand is in none of them
          </p>
        </div>
  ),

  models: (narrow) => (
        <div className="flex h-full flex-col p-9">
          <Micro className="text-gray-400">Answering from memory</Micro>
          <div className={`mt-8 grid flex-1 gap-6 ${narrow ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {[
              { name: 'ChatGPT', names: ['Northwind', 'Sable & Co', 'Vertex'], you: -1 },
              { name: 'Claude', names: ['Northwind', 'Ledgerly', 'Kestrel'], you: 1 },
              { name: 'Gemini', names: ['Sable & Co', 'Vertex', 'Ledgerly'], you: 2 },
            ].map((col) => (
              <div key={col.name} className="rounded-xl border p-6" style={{ borderColor: HAIR }}>
                <p className="text-[19px] font-bold tracking-tight text-gray-900">{col.name}</p>
                <ul data-answer className="mt-6 flex flex-col gap-4">
                  {col.names.map((n, i) => (
                    <li
                      key={n}
                      data-name
                      className="text-[17px] font-semibold"
                      style={{ color: i === col.you ? OLIVE : '#9CA3AF' }}
                    >
                      {n}
                      {i === col.you && <span className="ml-2 text-[13px] font-bold uppercase">you</span>}
                    </li>
                  ))}
                </ul>
                <p data-thinking className="mt-6 font-mono text-[15px] font-bold text-gray-300">
                  thinking…
                </p>
              </div>
            ))}
          </div>
        </div>
  ),

  score: () => (
        <div className="flex h-full flex-col p-9">
          <Micro className="text-gray-400">Share of voice</Micro>
          <p className="mt-7 flex items-baseline text-gray-900">
            <span data-count className="text-[112px] font-bold leading-[0.8] tracking-[-0.05em] tabular-nums">
              0
            </span>
            <span className="text-[44px] font-bold text-gray-300">%</span>
          </p>
          <p className="mt-4 text-[16px] font-medium text-gray-400">named in 11 of 45 answers</p>

          <div className="mt-auto flex flex-col gap-6">
            {[
              ['ChatGPT', '2/15', 13],
              ['Claude', '5/15', 33],
              ['Gemini', '4/15', 27],
            ].map(([label, value, pct]) => (
              <div key={label as string} className="flex items-center gap-4">
                <span className="w-[110px] shrink-0 text-[16px] font-semibold text-gray-900">{label as string}</span>
                <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    data-bar
                    className="block h-full origin-left rounded-full"
                    style={{ width: `${pct as number}%`, background: OLIVE }}
                  />
                </span>
                <span className="w-[70px] shrink-0 text-right font-mono text-[14px] font-bold tabular-nums text-gray-400">
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        </div>
  ),

  rivals: () => (
        <div className="flex h-full flex-col p-9">
          <Micro className="text-gray-400">Recommended instead of you</Micro>
          <div className="mt-8 flex flex-1 flex-col justify-center gap-7">
            {[
              ['Northwind', '13', 100, false],
              ['Sable & Co', '12', 92, false],
              ['You', '11', 85, true],
              ['Vertex', '10', 77, false],
            ].map(([label, value, pct, mine]) => (
              <div key={label as string} className="flex items-center gap-5">
                <span
                  className="w-[150px] shrink-0 text-[18px] font-semibold"
                  style={{ color: mine ? OLIVE : '#111827' }}
                >
                  {label as string}
                </span>
                <span className="h-[8px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    data-rival
                    className="block h-full origin-left rounded-full"
                    style={{ width: `${pct as number}%`, background: mine ? OLIVE : '#D8DCC8' }}
                  />
                </span>
                <span className="w-[60px] shrink-0 text-right font-mono text-[15px] font-bold tabular-nums text-gray-400">
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        </div>
  ),

  signals: () => (
        <div className="flex h-full flex-col p-9">
          <div className="flex items-baseline justify-between">
            <Micro className="text-gray-400">Technical readiness</Micro>
            <span className="font-mono text-[18px] font-bold tabular-nums text-gray-900">
              <span data-tech>0</span> / 100
            </span>
          </div>
          <ul className="mt-6 flex flex-1 flex-col justify-center">
            {[
              ['AI crawlers allowed in robots.txt', '25', true],
              ['Cited on third-party authority sites', '25', false],
              ['Organization schema markup', '15', false],
              ['Content published in the last 6 months', '10', true],
              ['Structured FAQ schema', '10', false],
              ['HTTPS', '5', true],
            ].map(([label, pts, ok]) => (
              <li
                key={label as string}
                data-signal
                className="flex items-center gap-5 border-b py-5 last:border-0"
                style={{ borderColor: HAIR }}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ok ? OLIVE : '#D8DCC8' }} />
                <span className="min-w-0 flex-1 text-[17px] font-medium text-gray-700">{label as string}</span>
                <span className="font-mono text-[14px] font-bold tabular-nums text-gray-400">{pts as string} pts</span>
              </li>
            ))}
          </ul>
        </div>
  ),

  trend: () => (
        <div className="flex h-full flex-col p-9">
          <Micro className="text-gray-400">Share of voice over time</Micro>
          <p className="mt-5 text-[46px] font-bold leading-none tracking-[-0.04em] text-gray-900">+8 pts</p>
          <p className="mt-3 text-[16px] font-medium text-gray-400">across five scans</p>

          <div className="relative mt-auto">
            <svg viewBox="0 0 420 190" className="w-full overflow-visible" fill="none">
              {[0, 47, 94, 141, 188].map((y) => (
                <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="#EFF1EA" strokeWidth="2" />
              ))}
              <path
                data-line
                d="M6 150 L108 132 L210 138 L312 96 L414 62"
                stroke={OLIVE}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                [6, 150],
                [108, 132],
                [210, 138],
                [312, 96],
                [414, 62],
              ].map(([cx, cy]) => (
                <circle key={cx} data-dot cx={cx} cy={cy} r="7" fill="#fff" stroke={OLIVE} strokeWidth="4" />
              ))}
            </svg>

            {/* The travelling readout. Positioned in percentages of the chart
                box so it tracks the line under any card width. */}
            <span
              data-readout
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg px-3.5 py-2 text-[15px] font-bold text-white"
              style={{ background: '#171A10', left: '1.4%', top: '79%' }}
            >
              16%
            </span>
          </div>
        </div>
  ),
};

/** The board, laid out in design space for the camera to fly over. */
function Board() {
  return (
    <>
      {CARDS.map((card) => (
        <Surface key={card.id} card={card}>
          {CONTENT[card.id](false)}
        </Surface>
      ))}
    </>
  );
}

/**
 * The same six cards, stacked and scaled to the reader's width.
 *
 * Used on phones and whenever motion is switched off. It is not a summary of
 * the board — it is the same six cards, full width, one after another, sharing
 * the single definition in `CONTENT` so the two views cannot drift apart.
 *
 * Nothing is scaled here. The cards are authored in what are, once the camera
 * is out of the picture, ordinary CSS pixels — 19px body, 13px labels — and
 * those are already the right sizes on a phone. An earlier version shrank each
 * card to a fixed authored width, which is exactly how its type ended up at
 * eight pixels. The fixed geometry exists for the camera, and the camera is not
 * here.
 */
function Stacked() {
  return (
    <ul className="flex flex-col gap-12">
      {CARDS.map((card, i) => (
        <li key={card.id}>
          {/* Offset by one: chapter 0 is the establishing shot, which has no
              card of its own — the six cards are chapters 1 to 6. */}
          <Micro style={{ color: MID, fontSize: 11 }}>{CHAPTERS[i + 1].label}</Micro>
          <p className="mb-5 mt-3 max-w-[52ch] text-[14px] font-medium leading-relaxed text-gray-500">
            {CHAPTERS[i + 1].blurb}
          </p>
          {/* Full width and natural height — no transform. The card's design
              units are ordinary CSS pixels (19px body, 13px labels), which are
              already the right sizes on a phone; scaling them to fit a fixed
              authored width was what dropped the type to eight pixels. Only the
              camera needs the fixed geometry, and the camera is not here. */}
          <div className="rounded-[18px] border bg-white" style={{ borderColor: HAIR }}>
            {CONTENT[card.id](Boolean(card.stacksNarrow))}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── What the reader can take ────────────────────────────────────────────── */

const REDUCED = '(prefers-reduced-motion: reduce)';
/** Below this the camera is not viable — see `Stacked`. */
const WIDE = '(min-width: 1024px)';

/**
 * True when the cinematic board should be built at all.
 *
 * Subscribed rather than read once, so rotating a tablet or changing the system
 * setting re-decides without a reload. The server snapshot is `false`: the
 * pre-rendered HTML is always the stacked, readable version, and the camera
 * only ever comes into existence after the client has confirmed it should.
 */
function useCinematic(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const a = window.matchMedia(REDUCED);
      const b = window.matchMedia(WIDE);
      a.addEventListener('change', onChange);
      b.addEventListener('change', onChange);
      return () => {
        a.removeEventListener('change', onChange);
        b.removeEventListener('change', onChange);
      };
    },
    () => !window.matchMedia(REDUCED).matches && window.matchMedia(WIDE).matches,
    () => false
  );
}

/* ── The component ───────────────────────────────────────────────────────── */

export default function ToolPresentation() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const cinematic = useCinematic();
  const [chapter, setChapter] = useState(0);

  useGSAP(
    () => {
      if (!cinematic || !stage.current || !board.current) return;

      const stageEl = stage.current;
      const boardEl = board.current;

      /* Design units → CSS pixels. Recomputed on every refresh so a resize
         re-frames the shot instead of leaving the camera pointing at nothing.

         Framing is expressed as "fill this fraction of the stage" rather than
         as a zoom multiplier. A multiplier makes a 420-unit card and a
         900-unit one land at wildly different apparent sizes, which is what
         made some shots feel enormous and others small; asking each shot to
         occupy the same share of the frame is the thing actually wanted. */
      const box = (cx: number, cy: number, w: number, h: number, fill: number) => () => {
        const r = stageEl.getBoundingClientRect();
        /* Whichever of width or height binds first, capped: without the cap a
           narrow card is enlarged until its type is enormous just because it
           had room to grow. */
        const k = Math.min((r.width * fill) / w, (r.height * fill) / h, MAX_SCALE);
        return { x: r.width / 2 - cx * k, y: r.height / 2 - cy * k, scale: k };
      };

      const framed = (f: () => { x: number; y: number; scale: number }) => ({
        x: () => f().x,
        y: () => f().y,
        scale: () => f().scale,
      });

      /** Frame one card so it occupies `fill` of the stage. */
      const onCard = (id: string, fill = CARD_FILL) => {
        const c = cardById(id);
        return framed(box(c.x + c.w / 2, c.y + c.h / 2, c.w, c.h, fill));
      };

      /** Frame all six at once — the establishing shot, and the closing one. */
      const onBoard = (fill = BOARD_FILL) => framed(box(BOUNDS.cx, BOUNDS.cy, BOUNDS.w, BOUNDS.h, fill));

      // ── Opening state: everything at once ────────────────────────────────
      const wide = onBoard();
      gsap.set(boardEl, { transformOrigin: '0 0', x: wide.x, y: wide.y, scale: wide.scale });

      gsap.set('[data-q]', { autoAlpha: 0, x: -26 });
      gsap.set('[data-name]', { autoAlpha: 0, y: 10 });
      gsap.set('[data-bar], [data-rival]', { scaleX: 0 });
      gsap.set('[data-signal]', { autoAlpha: 0.18 });
      gsap.set('[data-dot]', { autoAlpha: 0, scale: 0, transformOrigin: 'center' });
      gsap.set('[data-readout]', { autoAlpha: 0 });

      const line = boardEl.querySelector<SVGPathElement>('[data-line]');
      const len = line ? line.getTotalLength() : 0;
      if (line) gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageEl.parentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            /* One chapter per unit of timeline. Rounded down so the caption
               changes as the camera arrives, not as it leaves. */
            const at = Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length));
            setChapter(at);
          },
        },
      });

      /* Unit 0 is the establishing shot: the whole board, held, so the opening
         paragraph is read with all six surfaces already in view. It creeps
         very slightly closer across its unit — enough that the frame is alive
         while it is being read, not enough to be a move.

         From unit 1 each chapter is one card. The camera travels during the
         first third and the card animates in the rest, so the move is over
         before the thing you flew to starts doing anything. */
      tl.to(boardEl, { ...onBoard(BOARD_FILL + 0.05), duration: 1 }, 0);

      // 01 · the questions type in
      tl.to(boardEl, { ...onCard('questions'), duration: 0.45 }, 1);
      tl.to('[data-q]', { autoAlpha: 1, x: 0, stagger: 0.12, duration: 0.55 }, 1.35);

      // 02 · right to the models; each column drops "thinking" and resolves
      tl.to(boardEl, { ...onCard('models'), duration: 0.45 }, 2);
      tl.to('[data-thinking]', { autoAlpha: 0, duration: 0.15 }, 2.4);
      tl.to('[data-name]', { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 }, 2.45);

      // 03 · the number counts, the bars fill
      tl.to(boardEl, { ...onCard('score'), duration: 0.45 }, 3);
      tl.to(
        '[data-count]',
        {
          duration: 0.5,
          /* innerText tweening rather than a React state counter: this is
             scrubbed, so the value has to be able to run backwards when the
             reader scrolls up, and a state counter driven by an onUpdate would
             re-render the whole board sixty times a second to do it. */
          innerText: 24,
          snap: { innerText: 1 },
        },
        3.4
      );
      tl.to('[data-bar]', { scaleX: 1, stagger: 0.1, duration: 0.4 }, 3.45);

      // 04 · down and left to the rivals
      tl.to(boardEl, { ...onCard('rivals'), duration: 0.45 }, 4);
      tl.to('[data-rival]', { scaleX: 1, stagger: 0.11, duration: 0.45 }, 4.4);

      // 05 · across to the scorecard, which lights row by row
      tl.to(boardEl, { ...onCard('signals'), duration: 0.45 }, 5);
      tl.to('[data-signal]', { autoAlpha: 1, stagger: 0.09, duration: 0.35 }, 5.4);
      tl.to('[data-tech]', { innerText: 43, snap: { innerText: 1 }, duration: 0.5 }, 5.4);

      // 06 · the far corner: the line draws and the readout rides it
      tl.to(boardEl, { ...onCard('trend'), duration: 0.45 }, 6);
      if (line) tl.to(line, { strokeDashoffset: 0, duration: 0.75 }, 6.35);
      tl.to('[data-dot]', { autoAlpha: 1, scale: 1, stagger: 0.16, duration: 0.2 }, 6.4);
      tl.fromTo(
        '[data-readout]',
        { autoAlpha: 0, left: '1.4%', top: '79%' },
        { autoAlpha: 1, duration: 0.12 },
        6.42
      );
      tl.to('[data-readout]', { left: '98.6%', top: '33%', duration: 0.68 }, 6.42);

      // 07 · back out to where it started — now with everything filled in
      tl.to(boardEl, { ...onBoard(), duration: 0.7 }, 7.05);

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [cinematic] }
  );

  /* ── Narrow, or motion switched off: the same cards, standing still ────── */
  if (!cinematic) {
    return (
      <>
      <section className="bg-white px-6 pt-32 pb-20">
        <div className="mx-auto max-w-[720px]">
          <Opening />
          <div className="mt-14">
            <Stacked />
          </div>
          <p className="mt-14 border-t pt-8 text-[15px] font-medium leading-relaxed text-gray-500" style={{ borderColor: HAIR }}>
            <strong className="font-bold text-gray-900">{CHAPTERS[CHAPTERS.length - 1].label}</strong>{' '}
            {CHAPTERS[CHAPTERS.length - 1].blurb}
          </p>
        </div>
      </section>
      <PresentationCTA />
      </>
    );
  }

  return (
    <>
    <div ref={root} className="bg-white">
      {/* pt-32 clears the floating navbar; the bottom padding is deliberately
          small. The film begins immediately under these lines and the stage
          already centres the board inside itself, so anything more here reads
          as the heading and the animation belonging to different pages. */}
      <section className="px-6 pt-32 pb-6">
        <div className="mx-auto max-w-[1440px]">
          <Opening />
        </div>
      </section>

      {/* One viewport of scroll per chapter: the establishing shot, the six
          cards, and the pull-back to where it started. */}
      <div className="relative" style={{ height: `${CHAPTERS.length * 100}svh` }}>
        <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
          {/* The board. Fixed size in design units; the camera transforms it. */}
          <div ref={board} className="absolute left-0 top-0" style={{ width: BOARD_W, height: BOARD_H }}>
            <Board />
          </div>

          {/* Chapter caption — the only thing that does not live on the board,
              because it is the narrator and the board is the product.

              The scrim is not decoration. The board is white cards with dark
              text on them, and dark caption type laid straight over a card edge
              is unreadable for the second it takes to pass behind it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-9 pt-24">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, #fff 34%, rgba(255,255,255,0.92) 58%, rgba(255,255,255,0) 100%)' }}
            />
            <div className="relative mx-auto flex max-w-[1440px] items-end justify-between gap-8">
              <div>
                {/* Chapter 0 is the establishing shot and the last is the same
                    frame again, so neither of them gets a number — they are not
                    one of the six, they are all of them. */}
                <Micro style={{ color: MID, fontSize: 11 }}>
                  {chapter === 0 || chapter > CARDS.length
                    ? 'All six'
                    : `${String(chapter).padStart(2, '0')} / ${String(CARDS.length).padStart(2, '0')}`}
                </Micro>
                <p className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.03em] text-gray-900 sm:text-[34px]">
                  {CHAPTERS[chapter].label}
                </p>
                <p className="mt-2.5 max-w-[52ch] text-[14px] font-medium leading-relaxed text-gray-500">
                  {CHAPTERS[chapter].blurb}
                </p>
              </div>
              <span
                className="hidden shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 sm:block"
                style={{ background: '#F2F4EC' }}
              >
                Demo · fixed sample figures
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PresentationCTA />
    </>
  );
}

function PresentationCTA() {
  return (
    <section className="border-t border-[#E7ECD9] bg-white px-6 py-20 sm:py-24">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <img
          src={`${BASE}/cta-bg.webp`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#171A10]/95 via-[#171A10]/70 to-[#171A10]/20" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <Micro style={{ color: '#CBD0AC', fontSize: 11 }}>Ready to see your brand?</Micro>
            <h2 className="mt-5 max-w-[18ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Now run the scan on your own brand.
            </h2>
            <p className="mt-5 max-w-[52ch] text-base font-medium leading-relaxed text-[#CBD0AC]">
              The presentation shows what the report can reveal. The scan shows where you stand today.
            </p>
          </div>
          <a
            href={`${BASE}/thallo-ai/scan/`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#39471D] transition-colors hover:bg-[#E7ECD9]"
          >
            Try the scan <ArrowUpRight className="text-[11px]" />
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * One per chapter, plus a seventh for the closing wide shot.
 *
 * The last one is the only line on the page that is allowed to make a claim
 * about the whole product, and it is placed where it can be checked: by then
 * the reader is looking at all six surfaces at once.
 */
const CHAPTERS: { label: string; blurb: string }[] = [
  {
    label: 'The whole report, at a glance.',
    blurb:
      'Six surfaces, from the questions we send to the trend they add up to over months. The camera goes through them one at a time from here.',
  },
  {
    label: 'The questions',
    blurb: `${QUESTION_COUNT} questions a buyer would type, in the language of the market you sell into. Your brand is in none of them.`,
  },
  {
    label: 'The models',
    blurb: 'ChatGPT, Claude and Gemini answer from memory. Perplexity and Google AI Overview read the live web.',
  },
  {
    label: 'Your share of voice',
    blurb: 'How often you were named across all forty-five answers, and the rank you held when you were.',
  },
  {
    label: 'Named instead of you',
    blurb: 'Every other company the models put forward — the names holding the position you wanted.',
  },
  {
    label: 'Your own site',
    blurb: 'A hundred points checked live against your own site, every one traced to the row that earned it.',
  },
  {
    label: 'Month after month',
    blurb: 'Run it again next month and the number becomes a line. That is the part worth paying attention to.',
  },
  {
    label: 'That is the whole report.',
    blurb: 'Free to the share of voice and the audit trail. An email opens the rest. It takes about a minute.',
  },
];

/**
 * The page's opening lines.
 *
 * Set in the site's own heading scale — `text-4xl sm:text-5xl`,
 * `leading-[1.05]`, `tracking-tight` — which is what every other h1 on Thallo
 * uses. This one had been given a bespoke `clamp()` that ran up to 73px, half
 * again bigger than any heading elsewhere on the site, and the difference read
 * as a mistake rather than as emphasis. A page does not get its own type scale
 * because it is the newest one.
 */
function Opening() {
  return (
    <>
      <Micro style={{ color: MID, fontSize: 11 }}>Free · no account</Micro>
      <h1 className="mb-5 mt-6 max-w-[20ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
        Ask the machines what they say about you.
      </h1>
      <p className="max-w-[52ch] text-[15px] font-medium leading-relaxed text-gray-500">
        We put {QUESTION_COUNT} real buying questions to ChatGPT, Claude and Gemini and count how often your name comes
        up. Scroll to watch the report being made — then run it on your own brand.
      </p>
    </>
  );
}
