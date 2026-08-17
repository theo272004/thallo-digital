'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import TrendChart from './TrendChart';
import { Compass, FileText, Gauge, ListChecks, Search, TrendingUp, Trophy } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY, Head, Meter, Micro, Panel, ProviderMark, Stat, Tint, Verdict, type Tone } from './ui';
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

  /*
   * The headline counts both readings together.
   *
   * It used to be the memory figure alone, and that was a distinction the
   * reader had not been told about yet: the ring said 0% while the panel two
   * screens down said the models name you a quarter of the time when they
   * search. Both were true and the pair reads as the tool contradicting
   * itself — which is worse than either number being wrong, because it costs
   * the reader their trust in the whole report before they get to the part
   * that explains it.
   *
   * Pooled over the answers rather than averaged over the two percentages: the
   * two halves are deliberately different sizes (the search reading is capped
   * to keep the bill down), and averaging would let five answers weigh as much
   * as fifteen. One brand named in one answer out of twenty-one is 5%, however
   * the answers were split.
   *
   * The split itself is never hidden — it is named under the ring, given a
   * stat of its own, and diagnosed in full further down. The change is which
   * number is the one you see first, not which numbers are printed.
   */
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;
  const overallPct = grounded
    ? Math.round(((phase1.mentions + grounded.mentions) / (phase1.totalAnswers + grounded.totalAnswers)) * 100)
    : phase1.sovPct;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<FileText size={18} />}
          title={`The full report for ${phase1.brand}`}
          sub={`Measured against ${phase1.domain}. Every figure below traces to a row further down — nothing here is an estimate.`}
          chip={phase2.grade}
        />

        <div className="mt-7 grid grid-cols-1 gap-8 border-t border-gray-100 pt-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <div>
            <ScoreRing
              pct={overallPct}
              label={grounded ? 'Share of voice · overall' : 'Share of voice'}
              caption={
                grounded
                  ? `across ${phase1.totalAnswers + grounded.totalAnswers} answers`
                  : `across ${phase1.totalAnswers} answers`
              }
              size={152}
            />

            {/* The sentence a reader needs at the moment they see a low number,
                rather than two screens later. A brand the models can find but
                have never heard of is the common case for a good small company,
                and reading it as "we are invisible" is the wrong conclusion off
                the right figure. */}
            {grounded && phase1.sovPct === 0 && grounded.sovPct > 0 && (
              <p className="mt-4 text-center text-[12px] font-medium leading-relaxed text-gray-500">
                From memory the models do not know {phase1.brand} yet. They name it {grounded.sovPct}% of the time once
                they search.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <Tint>
              <Micro className="text-[#39471D]">Key insight</Micro>
              <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-gray-700">{phase2.keyInsight}</p>
            </Tint>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
              {/* The two readings side by side, in the order they are taken.
                  The ring above pools them; this is where the pair is legible,
                  because the gap between them is the finding — the same brand
                  can be a zero from memory and a third of the answers once the
                  models look, and those have opposite fixes. */}
              {grounded ? (
                <Stat value={`${phase1.sovPct}% → ${grounded.sovPct}%`} label="Memory → searching" />
              ) : (
                <Stat value={`${phase1.sovPct}%`} label="AI share of voice" />
              )}
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
        <Head
          badge={<TrendingUp size={18} />}
          title="Share of voice over time"
          sub={`Every scan of ${phase1.domain} in this market, oldest first. A single scan tells you where you stand; only the series tells you whether anything you changed worked.`}
        />
        <div className="mt-7">
          <TrendChart history={phase2.history ?? []} brand={phase1.brand} />
        </div>
      </Panel>

      {/* ── Recommended instead of you ───────────────────────────────────── */}
      <Panel>
        <Head
          badge={<Trophy size={18} />}
          title="Recommended instead of you"
          sub={`Every company the models named across the ${phase1.totalAnswers} answers, ranked by how often. These are the names occupying the position you want.`}
        />

        {phase2.competitors.length === 0 ? (
          <p className="mt-7 rounded-xl bg-gray-50 px-4 py-3.5 text-[13px] font-medium text-gray-500">
            The models named no consistent set of companies for this category — usually a sign the category label is
            too broad or too new for them to have an opinion about.
          </p>
        ) : (
          <ol className="mt-7 flex flex-col gap-3.5">
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
        <Head
          badge={<Search size={18} />}
          title="Live retrieval"
          sub={
            <>
              The models above answer from memory. These two search the web as they answer, so they measure something
              different: whether your pages are findable and quotable <em>today</em>.
            </>
          }
        />

        <div className="mt-7 flex flex-col gap-3">
          {phase2.retrieval.map((r) => (
            <div key={r.provider} className="rounded-xl border border-gray-200 p-4 sm:p-5">
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
        <Head
          badge={<Gauge size={18} />}
          title="Website & technical signals"
          sub={`Checked against ${phase1.domain}. Every point in the score above traces to a row here.`}
          chip={`${phase2.techScore} / ${maxTech}`}
        />

        <div className="mt-7 flex flex-col">
          {phase2.signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </div>
      </Panel>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<ListChecks size={18} />}
          title="What to do first"
          sub="Ordered by what the scan actually found, heaviest unmet signal first — not by a fixed script."
        />

        <div className="mt-7 flex flex-col gap-3">
          {phase2.actions.map((a, i) => (
            <div key={a.title} className="rounded-xl border border-gray-200 p-4 sm:p-5">
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Head
            badge={<Compass size={18} />}
            title="This is the measurement. The work is the other half."
            sub="A commissioned engagement takes the plan above and executes it — the content, the citations and the structure that move these numbers."
          />
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href={`${BASE}/contact/`} className={BTN_PRIMARY}>
              Talk to us <ArrowUpRight className="text-[12px]" />
            </a>
            <a href={`${BASE}/services/`} className={BTN_SECONDARY}>
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
        <Head badge={<Search size={18} />} title="When they search the web" />
        <p className="mt-7 rounded-xl bg-gray-50 px-4 py-3.5 text-[13px] font-medium leading-relaxed text-gray-500">
          Not measured — the second reading was attempted but no model answered. This is a fault at our end, not a
          finding about {memory.brand}.
        </p>
      </Panel>
    );
  }

  const delta = grounded.sovPct - memory.sovPct;

  /* How many questions were actually put a second time, read off the answers
     rather than assumed to be all of them. The searching half carries a
     per-call fee, so the settings screen lets it run over the first few
     questions only — and this panel said "we asked the same 15 questions
     twice" over a run of five. The worth of the panel is that the two halves
     are comparable; a miscounted method note is the first thing that would
     make a reader doubt it. */
  const askedTwice = Math.max(0, ...grounded.providers.map((p) => p.answers.length));

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
      <Head
        badge={<Compass size={18} />}
        title="Do they know you, or can they find you?"
        sub={`We asked ${askedTwice === memory.questions.length ? `the same ${askedTwice} questions` : `${askedTwice} of the same ${memory.questions.length} questions`} twice. Once with the models answering from memory, the way they do when nobody is looking anything up. Once with web search switched on, the way most people use them today. Those are different questions about you, and the answers come apart.`}
      />

      <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-gray-100 sm:grid-cols-2">
        <div className="bg-white p-4 sm:p-5">
          <p className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{memory.sovPct}%</p>
          <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">Named from memory</p>
          <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
            Out of {memory.totalAnswers} answers given without looking anything up. This is whether the models already
            know {memory.brand} — reputation, not pages.
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5">
          <p className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{grounded.sovPct}%</p>
          <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">Named when they search</p>
          <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
            Out of {grounded.totalAnswers} answers given with the web open. This is whether the models pick{' '}
            {memory.brand} once they have looked — pages, not reputation.
          </p>
        </div>
      </div>

      <p className="mt-6 mb-1 text-[12px] font-medium leading-relaxed text-gray-500">
        Model by model, from memory <span className="text-gray-300">→</span> when searching:
      </p>

      <ul className="mt-4 flex flex-col gap-3.5">
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
