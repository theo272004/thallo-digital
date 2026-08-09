'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import TrendChart from './TrendChart';
import { BTN_DARK, BTN_GHOST, Meter, Micro, Panel, ProviderMark, Stat, Verdict, type Tone } from './ui';
import { PROVIDER_LABEL, type ScanPhase1, type ScanPhase2, type RetrievalResult, type TechSignal } from '@/lib/scan/types';
import { BASE } from '@/lib/site';

const RETRIEVAL_TONE: Record<RetrievalResult['status'], Tone> = {
  cited: 'on',
  partial: 'mid',
  absent: 'off',
  unavailable: 'off',
};

const RETRIEVAL_LABEL: Record<RetrievalResult['status'], string> = {
  cited: 'Cited',
  partial: 'Partial',
  absent: 'Absent',
  unavailable: 'Not measured',
};

export default function FullReport({ phase1, phase2 }: { phase1: ScanPhase1; phase2: ScanPhase2 }) {
  /* The competitor bars are scaled against the strongest rival, not against the
     total answer count — otherwise a category where nobody dominates renders as
     five near-empty bars and reads as a rendering fault. */
  const topRival = Math.max(1, ...phase2.competitors.map((c) => c.mentions));
  const scoredSignals = phase2.signals.filter((s) => s.weight > 0);
  const maxTech = scoredSignals.reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <Panel>
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5">
          <p className="max-w-[32ch] truncate text-[15px] font-bold tracking-tight text-gray-900">
            {phase1.brand} · full report
          </p>
          <Micro className="text-gray-400">{phase1.domain}</Micro>
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-gray-100 pt-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <div>
            <ScoreRing pct={phase1.sovPct} label="Share of voice" size={152} />
            <p className="mt-5 text-center">
              <span className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{phase2.grade}</span>
              <Micro className="mt-2 block text-gray-400">Overall grade</Micro>
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-lg bg-[#F4FAF5] p-4 sm:p-5">
              <Micro className="text-[#39471D]">Key insight</Micro>
              <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-gray-700">{phase2.keyInsight}</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
              <Stat value={`${phase1.sovPct}%`} label="AI share of voice" />
              <Stat value={`${phase2.techScore}`} label={`Technical / ${maxTech}`} />
              <Stat
                value={phase2.serpScore < 0 ? '—' : String(phase2.serpScore)}
                label="Retrieval / 100"
                muted={phase2.serpScore < 0}
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Memory against search ────────────────────────────────────────── */}
      {phase2.grounded && <GroundedComparison memory={phase1} grounded={phase2.grounded} />}

      {/* ── Trend ────────────────────────────────────────────────────────── */}
      <Panel>
        <Micro className="text-gray-400">Share of voice over time</Micro>
        <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
          Every scan of {phase1.domain} in this market, oldest first. A single scan tells you where you stand; only
          the series tells you whether anything you changed worked.
        </p>
        <TrendChart history={phase2.history ?? []} brand={phase1.brand} />
      </Panel>

      {/* ── Recommended instead of you ───────────────────────────────────── */}
      <Panel>
        <Micro className="text-gray-400">Recommended instead of you</Micro>
        <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
          Every company the models named across the {phase1.totalAnswers} answers, ranked by how often. These are the
          names occupying the position you want.
        </p>

        {phase2.competitors.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-[13px] font-medium text-gray-500">
            The models named no consistent set of companies for this category — usually a sign the category label is
            too broad or too new for them to have an opinion about.
          </p>
        ) : (
          <ol className="flex flex-col gap-3.5">
            {phase2.competitors.map((c, i) => {
              const mine = c.name.toLowerCase() === phase1.brand.toLowerCase();
              return (
                <li key={c.name} className="flex items-center gap-3">
                  <Micro className="w-6 shrink-0 text-gray-300">{String(i + 1).padStart(2, '0')}</Micro>
                  <span
                    className={`w-[110px] shrink-0 truncate text-[13px] font-semibold sm:w-[180px] ${
                      mine ? 'text-[#39471D]' : 'text-gray-900'
                    }`}
                  >
                    {c.name}
                    {mine && <span className="ml-1.5 font-normal text-gray-400">(you)</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Meter pct={(c.mentions / topRival) * 100} tone={mine ? 'olive' : 'grey'} />
                  </span>
                  <span className="w-24 shrink-0 text-right">
                    <Micro className="text-gray-400">{c.mentions} mentions</Micro>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      {/* ── Grounded retrieval ───────────────────────────────────────────── */}
      <Panel>
        <Micro className="text-gray-400">Live retrieval</Micro>
        <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
          The models above answer from memory. These two search the web as they answer, so they measure something
          different: whether your pages are findable and quotable <em>today</em>.
        </p>

        <div className="flex flex-col gap-3">
          {phase2.retrieval.map((r) => (
            <div key={r.provider} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <ProviderMark provider={r.provider} />
                <span className="flex-1 text-[13px] font-bold text-gray-900">{PROVIDER_LABEL[r.provider]}</span>
                <Verdict tone={RETRIEVAL_TONE[r.status]}>{RETRIEVAL_LABEL[r.status]}</Verdict>
              </div>
              <p className="mt-2.5 text-[12px] font-medium leading-relaxed text-gray-500">{r.detail}</p>
              {r.citations && r.citations.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                  {r.citations.slice(0, 6).map((c) => (
                    <li key={c} className="rounded-sm bg-gray-50 px-2 py-1">
                      <span className="font-mono text-[10px] text-gray-500">{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Technical readiness ──────────────────────────────────────────── */}
      <Panel>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Micro className="text-gray-400">Website & technical signals</Micro>
          <Micro className="text-gray-900">
            {phase2.techScore} / {maxTech}
          </Micro>
        </div>
        <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
          Checked against {phase1.domain}. Every point in the score above traces to a row here.
        </p>

        <div className="flex flex-col">
          {phase2.signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </div>
      </Panel>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <Panel>
        <Micro className="text-gray-400">What to do first</Micro>
        <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
          Ordered by what the scan actually found, heaviest unmet signal first — not by a fixed script.
        </p>

        <div className="flex flex-col gap-3">
          {phase2.actions.map((a, i) => (
            <div key={a.title} className="rounded-lg border border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Micro className="shrink-0 text-gray-300">{String(i + 1).padStart(2, '0')}</Micro>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-gray-900">{a.title}</p>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-500">{a.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
                  <span>
                    <Micro className="block text-gray-400">Impact</Micro>
                    <span className="mt-2 flex gap-1">
                      {Array.from({ length: 4 }).map((_, d) => (
                        <span
                          key={d}
                          className={`h-[6px] w-[6px] rounded-full ${d < a.impact ? 'bg-[#39471D]' : 'bg-gray-200'}`}
                        />
                      ))}
                    </span>
                  </span>
                  <Verdict tone={a.priority === 'high' ? 'on' : a.priority === 'medium' ? 'mid' : 'off'}>
                    {a.priority}
                  </Verdict>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Method, kept with the report rather than hidden behind it ────── */}
      <Panel>
        <AuditTrail phase1={phase1} />
      </Panel>

      {/* ── Close ────────────────────────────────────────────────────────── */}
      <Panel>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[52ch]">
            <p className="text-[15px] font-bold tracking-tight text-gray-900">
              This is the measurement. The work is the other half.
            </p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
              A commissioned engagement takes the plan above and executes it — the content, the citations and the
              structure that move these numbers.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href={`${BASE}/contact/`} className={BTN_DARK}>
              Talk to us <ArrowUpRight className="text-[11px]" />
            </a>
            <a href={`${BASE}/services/`} className={BTN_GHOST}>
              See what we do
            </a>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/**
 * The same questions asked twice — once from memory, once with the web open.
 *
 * The single number people arrive for is the memory one, and on its own it is
 * ambiguous: a zero could mean the models cannot find you or that they can and
 * choose someone else. Those have opposite fixes, and the pair of numbers is
 * what tells them apart. So this reads as a comparison rather than as a second
 * score, and the sentence underneath names the diagnosis rather than leaving
 * the reader to infer it from two percentages.
 */
function GroundedComparison({ memory, grounded }: { memory: ScanPhase1; grounded: ScanPhase1 }) {
  /* Nothing came back at all — every request failed or the models were all
     skipped. Printing 0% here would be a finding we did not measure. */
  if (grounded.totalAnswers === 0) {
    return (
      <Panel>
        <Micro className="text-gray-400">When they search the web</Micro>
        <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-[13px] font-medium leading-relaxed text-gray-500">
          Not measured — the second reading was attempted but no model answered. This is a fault at our end, not a
          finding about {memory.brand}.
        </p>
      </Panel>
    );
  }

  const delta = grounded.sovPct - memory.sovPct;

  /* Ordered by which is most actionable, not by size of the gap. "Findable but
     unknown" is the common case for a good small company and has a clear fix;
     the reverse is rarer and more urgent, because it means the pages are the
     problem. */
  const [tone, verdict, reading]: [Tone, string, string] =
    grounded.sovPct > 0 && memory.sovPct === 0
      ? [
          'mid',
          'Findable, not yet known',
          `The models name ${memory.brand} when they can look it up, and never from memory. Your pages are doing their job; what is missing is everything off your own site — the roundups, comparisons and citations a model learns a category from. This is the most fixable version of a zero.`,
        ]
      : delta >= 15
        ? [
            'mid',
            'Search is carrying you',
            `${memory.brand} does much better when the models search than when they answer from memory. You are winning on pages and losing on reputation: worth pressing, because searched answers are what most buyers see today, but memory is what holds when they do not search.`,
          ]
        : delta <= -15
          ? [
              'off',
              'Losing ground when they look',
              `The models name ${memory.brand} from memory more often than when they search. Something about what is published right now is pushing you out of the answer — stale pages, thin category coverage, or competitors who have simply published more recently.`,
            ]
          : memory.sovPct === 0 && grounded.sovPct === 0
            ? [
                'off',
                'Absent either way',
                `Neither reading names ${memory.brand}. The models do not know you and cannot find you when they look, which points at the same fix in both directions: get named on sites other than your own, in the terms buyers actually use.`,
              ]
            : [
                'on',
                'Consistent across both',
                `${memory.brand} scores about the same whether the models search or answer from memory. That is the healthy shape — your presence does not depend on which mode the buyer happens to be in.`,
              ];

  return (
    <Panel>
      <Micro className="text-gray-400">Memory against search</Micro>
      <p className="mt-4 mb-6 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
        The same {memory.questions.length} questions, put to the same three models a second time — this time with web
        search on. The first reading asks whether they know you. This one asks whether they pick you once they have
        looked.
      </p>

      <div className="grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100">
        <Stat value={`${memory.sovPct}%`} label={`From memory · ${memory.totalAnswers} answers`} />
        <Stat value={`${grounded.sovPct}%`} label={`Searching · ${grounded.totalAnswers} answers`} />
      </div>

      <ul className="mt-6 flex flex-col gap-3.5">
        {grounded.providers.map((g) => {
          const m = memory.providers.find((p) => p.provider === g.provider);
          const mPct = m && m.answers.length ? Math.round((m.mentions / m.answers.length) * 100) : null;
          const gPct = g.answers.length ? Math.round((g.mentions / g.answers.length) * 100) : null;

          return (
            <li key={g.provider} className="flex items-center gap-3">
              <ProviderMark provider={g.provider} />
              <span className="w-[92px] shrink-0 truncate text-[13px] font-semibold text-gray-900">
                {PROVIDER_LABEL[g.provider]}
              </span>
              {gPct === null ? (
                <span className="text-[12px] font-medium text-gray-400">{g.error ?? 'not measured'}</span>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <Meter pct={gPct} />
                  </div>
                  <span className="w-[104px] shrink-0 text-right text-[12px] font-medium tabular-nums text-gray-500">
                    {mPct === null ? '—' : `${mPct}%`} <span className="text-gray-300">→</span>{' '}
                    <span className="font-semibold text-gray-900">{gPct}%</span>
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <Verdict tone={tone}>{verdict}</Verdict>
        <p className="mt-3 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">{reading}</p>
      </div>
    </Panel>
  );
}

function SignalRow({ signal }: { signal: TechSignal }) {
  const icon =
    signal.status === 'pass' ? (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#39471D]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    ) : signal.status === 'warn' ? (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7ECD9]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#39471D" strokeWidth="3" strokeLinecap="round">
          <path d="M12 8v5m0 3.5v.5" />
        </svg>
      </span>
    ) : (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-200">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="3.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
    );

  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-3.5 last:border-0">
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-gray-900">{signal.label}</span>
        {signal.note && <span className="mt-1 block text-[11px] font-medium leading-relaxed text-gray-400">{signal.note}</span>}
      </span>
      <Micro className={`shrink-0 tabular-nums ${signal.weight === 0 ? 'text-gray-300' : 'text-gray-500'}`}>
        {signal.weight === 0 ? 'not scored' : `${signal.earned} / ${signal.weight}`}
      </Micro>
    </div>
  );
}
