'use client';

import React, { useEffect, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SCAN_STEPS } from '@/lib/scan/types';

/**
 * Scanning screen.
 *
 * Phase 1 rows advance as the models answer. Phase 2 rows are shown *locked*
 * rather than pending — they genuinely do not run until an email is given, and
 * showing them as imminent would be the same theatre this tool replaces. Live,
 * `done` is driven by polling the scan status instead of a timer.
 */
export default function ScanProgress({ brand }: { brand: string }) {
  const phase1 = SCAN_STEPS.filter((s) => s.phase === 1);
  const phase2 = SCAN_STEPS.filter((s) => s.phase === 2);
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = phase1.map((_, i) => setTimeout(() => setDone(i + 1), 700 + i * 620));
    return () => timers.forEach(clearTimeout);
  }, [phase1.length]);

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
      <Eyebrow className="mb-6">Scanning</Eyebrow>
      <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-2">Asking the models about {brand}…</h2>
      <p className="text-[14px] text-gray-500 font-medium mb-10">
        Five buying questions, three models, fifteen answers.
      </p>

      <div className="flex flex-col">
        {phase1.map((step, i) => {
          const state = i < done ? 'done' : i === done ? 'active' : 'queued';
          return (
            <div key={step.id} className="flex items-center gap-4 py-4 border-b border-gray-50">
              <StatusDot state={state} />
              <span
                className={`text-[14px] font-semibold flex-grow transition-colors ${
                  state === 'queued' ? 'text-gray-300' : 'text-gray-900'
                }`}
              >
                {step.label}
              </span>
              <div className="w-24 sm:w-40 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#39471D] rounded-full"
                  style={{
                    width: state === 'done' ? '100%' : state === 'active' ? '55%' : '0%',
                    transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  }}
                />
              </div>
              {/* Questions sent, not answers found — the count of mentions is
                  a result and must not appear before there are results. */}
              <span className="font-mono text-[10px] tracking-wider uppercase text-gray-400 w-20 text-right hidden sm:block">
                {state === 'done' ? '5 asked' : state === 'active' ? 'asking…' : ''}
              </span>
            </div>
          );
        })}

        {phase2.map((step) => (
          <div key={step.id} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
            <span className="w-5 h-5 shrink-0 flex items-center justify-center">
              <LockIcon />
            </span>
            <span className="text-[14px] font-semibold text-gray-300 flex-grow">{step.label}</span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-gray-300">Locked</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ state }: { state: 'done' | 'active' | 'queued' }) {
  if (state === 'done') {
    return (
      <span className="w-5 h-5 shrink-0 rounded-full bg-[#39471D] flex items-center justify-center">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="w-5 h-5 shrink-0 rounded-full border-2 border-[#39471D] border-t-transparent animate-spin" />
    );
  }
  return <span className="w-5 h-5 shrink-0 rounded-full border-2 border-gray-100" />;
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
