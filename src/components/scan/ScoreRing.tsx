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
        <span className="text-4xl font-bold leading-none tracking-tight text-gray-900 tabular-nums">{safe}%</span>
        {/* 13ch, not 11. The labels used to be "Share of voice"; they are
            "Brand knowledge" and "AI visibility" now, and at 11ch the word
            KNOWLEDGE is 90px inside an 81px box — it overflowed the cap by 8px
            and touched the arc. Measured with the site's own Inter at 11px and
            0.18em tracking, 13ch clears the longest of the two. */}
        <Micro className="mt-2.5 block max-w-[13ch] leading-tight text-gray-400">{label}</Micro>
      </div>
    </div>
    {caption && (
      <span className="mt-3 block text-center text-[11px] font-medium leading-snug text-gray-400">{caption}</span>
    )}
    </div>
  );
}
