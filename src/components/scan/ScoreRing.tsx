'use client';

import React from 'react';
import { Micro } from './ui';

/**
 * The headline gauge.
 *
 * The track is drawn full and the arc is drawn over it with a dash offset, so a
 * 0% score still shows a ring rather than nothing at all — an empty frame reads
 * as "failed to load" where a full track reads as "nothing scored yet", which is
 * the actual finding for most brands running this.
 */
export default function ScoreRing({
  pct,
  label,
  caption,
  size = 168,
}: {
  pct: number;
  label: string;
  caption?: string;
  size?: number;
}) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, pct));

  /* Everything inside the disc is a fraction of the ring, never a constant.

     The same markup is drawn at 168 on the results screen and at 128 in the
     report, and a 36px number with an 11px label under it — the right pair for
     the big one — did not fit the small one at all: the label crossed the arc
     and printed on top of the stroke.

     The cap on the label is well under the width of the hole, because the hole
     is a circle and the label does not sit in the middle of it. Two lines below
     a number this size put the lower one where the circle has already narrowed
     by a fifth, and a box measured at the widest point overflows there. */
  const hole = (size * 2 * (r - 5)) / 120;
  const numberSize = Math.round(size * 0.215);
  const labelSize = Math.max(9, Math.round(size * 0.066));

  return (
    /* The caption sits under the ring, not inside it.
     *
     * Inside, it had the width of a circle to live in: "across 6 answers with
     * the web open" wrapped to three lines, pushed the label into the arc and
     * spilled out of the disc. Anything that varies in length — and a caption
     * naming a count always does — cannot be laid out in a hole whose width is
     * fixed by a stroke. The label stays in, because it is short by
     * construction; the sentence goes below, where it has the column. */
    <div className="mx-auto flex flex-col items-center" style={{ width: size }}>
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F2F1ED" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#39471D"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(circ * safe) / 100} ${circ}`}
          style={{ transition: 'stroke-dasharray .9s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-bold leading-none tracking-tight text-gray-900 tabular-nums"
          style={{ fontSize: numberSize }}
        >
          {safe}%
        </span>
        <Micro
          className="block text-gray-400"
          style={{
            fontSize: labelSize,
            marginTop: Math.round(size * 0.05),
            maxWidth: Math.round(hole * 0.78),
            lineHeight: 1.25,
          }}
        >
          {label}
        </Micro>
      </div>
    </div>
    {caption && (
      <span className="mt-3 block text-center text-[11px] font-medium leading-snug text-gray-400">{caption}</span>
    )}
    </div>
  );
}
