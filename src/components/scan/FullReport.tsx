'use client';

import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ScoreRing from './ScoreRing';
import AuditTrail from './AuditTrail';
import { PROVIDER_LABEL, type ScanResult, type TechSignal } from '@/lib/scan/types';

/** Unlocked report: everything the email bought. */
export default function FullReport({ scan }: { scan: ScanResult }) {
  const p2 = scan.phase2!;

  return (
    <div className="flex flex-col gap-6">
      {/* Executive summary */}
      <div className="bg-[#39471D] rounded-[28px] p-8 sm:p-12 text-white">
        <Eyebrow tone="light" className="mb-7">
          Executive summary
        </Eyebrow>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] mb-5">{p2.keyInsight}</h2>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <Metric value={`${scan.sovPct}%`} label="AI visibility" />
              <Metric value={`${p2.techScore}/100`} label="Technical readiness" />
              <Metric value={`${p2.serpScore}/100`} label="Brand SERP" />
            </div>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <span className="font-serif text-[84px] leading-none text-[#DFFF3B]">{p2.grade}</span>
            <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#CBD0AC] mt-2">
              Overall grade
            </span>
          </div>
        </div>
      </div>

      {/* Competitors — the reveal */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-3">Recommended instead of you</Eyebrow>
        <p className="text-[14px] text-gray-500 font-medium mb-8 max-w-[58ch]">
          Brands the models named across the same {scan.totalAnswers} answers. This is your real competitive set in
          AI search — often not the one you track.
        </p>
        <div className="flex flex-col gap-2.5">
          {p2.competitors.map((c, i) => {
            const top = p2.competitors[0].mentions;
            return (
              <div key={c.name} className="flex items-center gap-5 bg-[#F7F8F4] rounded-2xl px-6 py-5">
                <span className="font-mono text-[11px] text-gray-400 tabular-nums shrink-0">0{i + 1}</span>
                <span className="text-[15px] font-bold text-gray-900 w-36 sm:w-44 shrink-0 truncate">{c.name}</span>
                <div className="flex-grow h-[6px] bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-[#39471D] rounded-full"
                    style={{ width: `${(c.mentions / top) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-gray-500 tabular-nums shrink-0">
                  {c.mentions} mentions
                </span>
              </div>
            );
          })}

          <div className="flex items-center gap-5 rounded-2xl px-6 py-5 border-2 border-dashed border-[#DFFF3B] bg-[#FBFFE8]">
            <span className="font-mono text-[11px] text-[#55672E] tabular-nums shrink-0">You</span>
            <span className="text-[15px] font-bold text-gray-900 w-36 sm:w-44 shrink-0 truncate">{scan.brand}</span>
            <div className="flex-grow h-[6px] bg-gray-200 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-[#DFFF3B] rounded-full"
                style={{ width: `${(scan.mentions / p2.competitors[0].mentions) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-[#55672E] font-bold tabular-nums shrink-0">
              {scan.mentions} mentions
            </span>
          </div>
        </div>
      </div>

      {/* Retrieval layer */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-3">Live retrieval</Eyebrow>
        <p className="text-[14px] text-gray-500 font-medium mb-8 max-w-[58ch]">
          The models above answer from memory. These two search the web as they answer — they measure whether your
          content is findable <em>today</em>, which is a different problem with a different fix.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {p2.retrieval.map((r) => (
            <div key={r.provider} className="border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-[14px] font-bold text-gray-900">{PROVIDER_LABEL[r.provider]}</span>
                <StatusPill status={r.status} />
              </div>
              <p className="text-[12.5px] text-gray-500 font-medium leading-relaxed">{r.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical signals */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-3">Technical readiness</Eyebrow>
        <p className="text-[14px] text-gray-500 font-medium mb-8 max-w-[58ch]">
          Every point below traces to a check we ran against {scan.domain}. Nothing here is an estimate.
        </p>
        <div className="flex flex-col">
          {p2.signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 sm:p-12">
        <Eyebrow className="mb-8">Priority actions</Eyebrow>
        <div className="flex flex-col gap-3">
          {p2.actions.map((a, i) => (
            <div key={a.title} className="flex flex-col sm:flex-row sm:items-center gap-5 bg-[#F7F8F4] rounded-2xl px-7 py-6">
              <span className="font-mono text-[11px] text-gray-400 tabular-nums shrink-0">0{i + 1}</span>
              <div className="flex-grow">
                <p className="text-[15px] font-bold text-gray-900 mb-1.5">{a.title}</p>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[62ch]">{a.detail}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div>
                  <p className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1.5">
                    Impact
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d <= a.impact ? '#39471D' : '#E5E7EB' }}
                      />
                    ))}
                  </div>
                </div>
                <span
                  className={`font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-3 py-1.5 rounded-full ${
                    a.priority === 'high' ? 'bg-[#39471D] text-white' : 'bg-[#DFFF3B] text-[#39471D]'
                  }`}
                >
                  {a.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AuditTrail scan={scan} />

      {/* Close */}
      <div className="bg-[#F7F8F4] border border-gray-100 rounded-[28px] p-8 sm:p-12 text-center">
        <h3 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4">Want this fixed rather than measured?</h3>
        <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-[52ch] mx-auto mb-8">
          A full audit goes deeper on every line above and comes with the roadmap to close the gap.
        </p>
        <a
          href="mailto:hello@thallodigital.com?subject=AI Visibility Audit Request"
          className="inline-block px-8 py-4 bg-[#39471D] rounded-full text-sm font-bold text-white hover:bg-[#55672E] transition-colors"
        >
          Book an audit →
        </a>
      </div>
    </div>
  );
}

function SignalRow({ signal }: { signal: TechSignal }) {
  const scored = signal.weight > 0;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <StatusMark status={signal.status} />
      <div className="flex-grow">
        <p className={`text-[14px] font-semibold ${scored ? 'text-gray-900' : 'text-gray-400'}`}>{signal.label}</p>
        {signal.note && (
          <p className="text-[12px] text-gray-400 font-medium leading-relaxed mt-1 max-w-[64ch]">{signal.note}</p>
        )}
      </div>
      <span
        className={`font-mono text-[11px] tabular-nums shrink-0 ${
          !scored ? 'text-gray-300' : signal.earned === signal.weight ? 'text-[#39471D] font-bold' : 'text-gray-400'
        }`}
      >
        {scored ? `${signal.earned} / ${signal.weight}` : 'Not scored'}
      </span>
    </div>
  );
}

function StatusMark({ status }: { status: TechSignal['status'] }) {
  const color = status === 'pass' ? '#39471D' : status === 'warn' ? '#B4A02E' : '#E11D48';
  return (
    <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
        {status === 'pass' ? <path d="M20 6L9 17l-5-5" /> : status === 'warn' ? <path d="M12 8v5m0 3.5v.5" /> : <path d="M18 6L6 18M6 6l12 12" />}
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: 'cited' | 'partial' | 'absent' }) {
  const map = {
    cited: 'bg-[#39471D] text-white',
    partial: 'bg-[#DFFF3B] text-[#39471D]',
    absent: 'bg-gray-100 text-gray-400',
  };
  return (
    <span className={`font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-3 py-1.5 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-[#DFFF3B] leading-none mb-1.5 tabular-nums">{value}</p>
      <p className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-[#CBD0AC]">{label}</p>
    </div>
  );
}
