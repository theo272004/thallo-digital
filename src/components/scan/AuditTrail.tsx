'use client';

import React, { useState } from 'react';
import { Micro, ProviderMark, Verdict } from './ui';
import { PROVIDER_LABEL, type ScanPhase1 } from '@/lib/scan/types';

/**
 * The exact questions we sent, and what came back from each model.
 *
 * This is the part that makes the number above it worth anything. A visibility
 * score with no visible method is a number someone made up, and a buyer is
 * right to treat it that way — so every question, every model and every hit is
 * printed here, collapsed by default so it does not swamp the result.
 */
export default function AuditTrail({ phase1 }: { phase1: ScanPhase1 }) {
  const [open, setOpen] = useState(false);
  const answered = phase1.providers.filter((p) => !p.error);

  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
      >
        <span>
          <Micro className="block text-gray-900">See the exact questions we asked</Micro>
          <span className="mt-1.5 block text-[11px] font-medium text-gray-500">
            {phase1.questions.length} questions · {answered.length} models · {phase1.totalAnswers} answers
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="#39471D"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Legend, so the marks below need no explaining twice. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
            {answered.map((p) => (
              <span key={p.provider} className="flex items-center gap-2">
                <ProviderMark provider={p.provider} />
                <span>
                  <Micro className="block text-gray-700">{PROVIDER_LABEL[p.provider]}</Micro>
                  <span className="block font-mono text-[10px] text-gray-400">{p.model}</span>
                </span>
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left">
                    <Micro className="text-gray-400">Question</Micro>
                  </th>
                  {answered.map((p) => (
                    <th key={p.provider} className="w-[110px] px-3 py-2.5 text-right">
                      <Micro className="text-gray-400">{PROVIDER_LABEL[p.provider]}</Micro>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {phase1.questions.map((q, i) => (
                  <tr key={q} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 align-top">
                      <span className="flex gap-2.5">
                        <span className="font-mono text-[10px] font-bold text-gray-300 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[13px] font-medium leading-snug text-gray-700">{q}</span>
                      </span>
                    </td>
                    {answered.map((p) => {
                      const a = p.answers[i];
                      if (!a) return <td key={p.provider} className="px-3 py-3 text-right align-top" />;
                      return (
                        <td key={p.provider} className="px-3 py-3 text-right align-top">
                          {a.mentioned ? (
                            <Verdict tone="on">{a.position ? `#${a.position}` : 'Named'}</Verdict>
                          ) : (
                            <Verdict tone="off">—</Verdict>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-gray-100 px-4 py-3">
            <Micro className="text-gray-400">
              A number is the rank your brand held in that answer · — means it was not named
            </Micro>
          </p>
        </div>
      )}
    </div>
  );
}
