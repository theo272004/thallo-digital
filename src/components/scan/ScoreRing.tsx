'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  /** 0–100 */
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
};

const R = 52;
const C = 2 * Math.PI * R;

/**
 * Share-of-voice ring. Olive track fills to `value`, with the lime signature
 * capping the arc so the accent lands on the number that matters.
 */
export default function ScoreRing({ value, size = 132, label, sublabel }: Props) {
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const filled = C * (drawn / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#EAEDE3" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="#39471D"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${C}`}
            style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1)' }}
          />
          {/* Lime cap — only meaningful once there is an arc to cap. */}
          {drawn > 3 && (
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#DFFF3B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(14, filled)} ${C}`}
              strokeDashoffset={-(filled - Math.min(14, filled))}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-serif text-[#39471D] leading-none"
            style={{ fontSize: size * 0.3, fontVariantNumeric: 'tabular-nums' }}
          >
            {Math.round(drawn)}
            <span style={{ fontSize: size * 0.16 }}>%</span>
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-3 font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#55672E] text-center">
          {label}
        </span>
      )}
      {sublabel && <span className="mt-1 text-[11px] text-gray-400 font-medium">{sublabel}</span>}
    </div>
  );
}
