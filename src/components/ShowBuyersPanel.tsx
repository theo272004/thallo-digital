'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, LayoutTemplate, MessagesSquare, Mic, PenLine, Scale, Target, Users } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * The right half of Show Buyers: a pale panel holding a deck of cards that
 * tells the whole process the two paragraphs describe, one step per card, in
 * order, and then starts again.
 *
 * Every card is named with a phrase lifted word for word from the copy beside
 * it, so the drawing can be read (an earlier, wordless version could not: "no
 * entiendo… ¿por qué un micrófono?"), and no new words are added. The icon is
 * the step: the microphone is the interviews with your experts.
 *
 * The front card is the step now; the next two sit under it, each a little
 * smaller and further down, so the one coming in is always in view (Cami, 3
 * November). Every few seconds the front card lifts away and the deck moves
 * up. The dots under it count the eight steps in two groups, research and
 * plan, the two paragraphs.
 *
 * It can be driven by hand (Cami, 3 November: "que yo también pueda dar
 * clic… si lo quiero leer muy rápido"): click the front card or the arrow to
 * go on, the other arrow to go back, a dot to jump. Any of those restarts the
 * clock, and the deck holds still while the pointer is over it.
 *
 * Labels are balanced across their lines, so a two-line one never leaves a
 * pair of words on its own ("recommend it" was).
 *
 * Only the full olive, never a tint of it (no light green on this site).
 */

const STEPS: { text: string; Icon: typeof Mic }[] = [
  { text: 'We interview your experts', Icon: Mic },
  { text: 'conduct customer research', Icon: Users },
  { text: 'using sales materials and search data', Icon: FileText },
  { text: 'understand how buyers compare their options', Icon: Scale },
  { text: 'plan your website’s structure', Icon: LayoutTemplate },
  { text: 'decide which content and resources to create', Icon: PenLine },
  { text: 'reach the right people', Icon: Target },
  { text: 'a reason to remember your business and recommend it', Icon: MessagesSquare },
];
const N = STEPS.length;
const STEP_MS = 2800;

/* Where a card sits by how far it is behind the front one. */
function place(offset: number) {
  if (offset === 0) return { transform: 'translateY(0) scale(1)', opacity: 1, zIndex: 30 };
  if (offset === 1) return { transform: 'translateY(22px) scale(0.94)', opacity: 0.75, zIndex: 20 };
  if (offset === 2) return { transform: 'translateY(42px) scale(0.88)', opacity: 0.4, zIndex: 10 };
  if (offset === N - 1) return { transform: 'translateY(-28px) scale(1.02)', opacity: 0, zIndex: 40 };
  return { transform: 'translateY(56px) scale(0.84)', opacity: 0, zIndex: 0 };
}

export default function ShowBuyersPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  /* Bumped by every hand move, so the clock starts its wait over. */
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Turn the deck while it is on screen and nobody is holding it. */
  useEffect(() => {
    if (!visible || hover || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setActive((a) => (a + 1) % N), STEP_MS);
    return () => window.clearInterval(timer);
  }, [visible, hover, nudge]);

  const go = (i: number) => {
    setActive(((i % N) + N) % N);
    setNudge((n) => n + 1);
  };

  const arrow =
    'flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors duration-300 hover:border-[#39471D] hover:bg-[#39471D] hover:text-white';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative h-[320px] overflow-hidden rounded-[28px] bg-[#ECEDEF] lg:h-full"
    >
      {/* The box is exactly the front card, centred in the panel both ways:
          the card being shown is what sits in the middle (Cami, 3 November).
          The two coming next peek out under it, past the box. */}
      <div className="absolute left-1/2 top-1/2 h-[96px] w-[calc(100%-3rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2">
        {STEPS.map(({ text, Icon }, i) => {
          const offset = (i - active + N) % N;
          const front = offset === 0;
          return (
            <button
              key={text}
              type="button"
              tabIndex={front ? 0 : -1}
              aria-hidden={front ? undefined : true}
              onClick={() => go(active + 1)}
              className={`absolute inset-x-0 top-0 flex h-[96px] origin-top items-center gap-4 rounded-2xl border border-gray-200/70 bg-white px-5 text-left shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                front ? 'cursor-pointer' : 'pointer-events-none'
              }`}
              style={place(offset)}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#39471D] text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-gray-900 text-balance first-letter:uppercase">
                {text}
              </span>
              <span className="self-start pt-4 text-[11px] font-semibold tabular-nums text-gray-400">
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Back, the eight steps in two groups (research, then plan), on: held
          to the panel's foot so they never pull the card off centre. */}
      <div className="absolute inset-x-0 bottom-7 flex items-center justify-center gap-4">
        <button type="button" aria-label="Previous" onClick={() => go(active - 1)} className={arrow}>
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-1.5">
          {STEPS.map(({ text }, i) => (
            <React.Fragment key={text}>
              {i === 4 && <span className="w-3" />}
              <button
                type="button"
                aria-label={String(i + 1)}
                aria-current={i === active ? 'step' : undefined}
                onClick={() => go(i)}
                className="flex h-5 items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? 'w-5 bg-[#39471D]' : 'w-1.5 bg-gray-300 hover:bg-gray-500'
                  }`}
                />
              </button>
            </React.Fragment>
          ))}
        </div>
        <button type="button" aria-label="Next" onClick={() => go(active + 1)} className={arrow}>
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
