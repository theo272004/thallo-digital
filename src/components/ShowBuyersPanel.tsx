'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileText, LayoutTemplate, MessagesSquare, Mic, PenLine, Scale, Target, Users } from 'lucide-react';
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

  /* Turn the deck while it is on screen. */
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) timer = window.setInterval(() => setActive((a) => (a + 1) % N), STEP_MS);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="flex flex-col items-center justify-center rounded-[28px] bg-[#ECEDEF] px-6 py-12 sm:px-12 lg:h-full"
    >
      <div className="relative h-[150px] w-full max-w-[400px]">
        {STEPS.map(({ text, Icon }, i) => {
          const offset = (i - active + N) % N;
          return (
            <div
              key={text}
              className="absolute inset-x-0 top-0 flex h-[96px] origin-top items-center gap-4 rounded-2xl border border-gray-200/70 bg-white px-5 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={place(offset)}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#39471D] text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-gray-900 first-letter:uppercase">
                {text}
              </span>
              <span className="self-start pt-4 text-[11px] font-semibold tabular-nums text-gray-400">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Eight steps, two groups: the research, then the plan. */}
      <div className="mt-6 flex items-center gap-1.5">
        {STEPS.map(({ text }, i) => (
          <React.Fragment key={text}>
            {i === 4 && <span className="w-3" />}
            <span
              className={`block h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-5 bg-[#39471D]' : 'w-1.5 bg-gray-300'
              }`}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
