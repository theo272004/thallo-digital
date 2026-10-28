'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

/**
 * A line that fills in, word by word, as it scrolls up the screen.
 *
 * Every word starts pale and takes its own colour in turn, tied to the scroll
 * position rather than to a timer: scroll back up and it empties again. Added
 * for the playbook's closing line at Cami's request, 5 October 2026.
 *
 * `parts` is the sentence in runs, each with the colour it ends on, so a phrase
 * can finish in the olive while the rest finishes near-black.
 */
export type FillPart = { text: string; color: string };

const START = '#D1D5DB'; // gray-300: present enough to read, clearly unfilled

export function ScrollFill({
  parts,
  as: Tag = 'p',
  className,
}: {
  parts: FillPart[];
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-fill]'));
      const final = (w: HTMLElement) => w.dataset.fill as string;

      if (prefersReducedMotion()) {
        words.forEach((w) => gsap.set(w, { color: final(w) }));
        return;
      }

      gsap.set(words, { color: START });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', scrub: 0.6 },
      });
      words.forEach((w, i) => tl.to(w, { color: final(w), duration: 1, ease: 'none' }, i * 0.5));

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: ref }
  );

  let key = 0;
  return (
    <Tag ref={ref} className={className}>
      {parts.map((part) =>
        part.text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((token) =>
            /^\s+$/.test(token) ? (
              token
            ) : (
              <span key={key++} data-fill={part.color} style={{ color: part.color }}>
                {token}
              </span>
            )
          )
      )}
    </Tag>
  );
}
