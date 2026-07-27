'use client';

import React, { useState } from 'react';
import { PROVIDER_LABEL, type ScanPhase1 } from '@/lib/scan/types';

/**
 * The credibility anchor: the exact prompts, models and timestamp behind the
 * numbers above. An audit a buyer cannot inspect is just an opinion, so this
 * stays one click away from every result.
 */
export default function AuditTrail({ scan }: { scan: ScanPhase1 }) {
  const [open, setOpen] = useState(false);

  const stamp = new Date(scan.scannedAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-[#F7F8F4] border border-gray-100 rounded-[28px] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-6 px-8 sm:px-11 py-6 text-left hover:bg-[#F1F3EA] transition-colors"
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-[#55672E]">
          {scan.questions.length} questions · {scan.providers.length} models · {stamp}
        </span>
        <span className="flex items-center gap-2.5 shrink-0">
          <span className="text-[13px] font-bold text-[#39471D] hidden sm:inline">
            See the exact questions we asked
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#39471D"
            strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-8 sm:px-11 pb-9 pt-1">
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed mb-6 max-w-[62ch]">
            Each question below was sent to each model without web search, so the answer reflects what the model
            already knows about your category. Models are non-deterministic — wording and ordering shift between
            runs, which is why we sample {scan.totalAnswers} answers rather than one.
          </p>

          <ol className="flex flex-col gap-2.5 mb-8">
            {scan.questions.map((q, i) => (
              <li key={q} className="flex items-start gap-4 bg-white rounded-2xl px-6 py-4 border border-gray-100">
                <span className="font-mono text-[11px] text-gray-400 tabular-nums mt-0.5">0{i + 1}</span>
                <span className="text-[13.5px] text-gray-800 font-medium leading-snug">{q}</span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {scan.providers.map((p) => (
              <div key={p.provider}>
                <p className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">
                  {PROVIDER_LABEL[p.provider]}
                </p>
                <p className="font-mono text-[12px] text-gray-800">{p.model}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
