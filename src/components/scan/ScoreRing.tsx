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
    <div className="relative mx-auto" style={{ width: size, height: size }}>
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
        <Micro className="mt-2.5 block max-w-[12ch] leading-tight text-gray-400">{label}</Micro>
        {caption && <span className="mt-1.5 text-[11px] font-medium text-gray-400">{caption}</span>}
      </div>
    </div>
  );
}
