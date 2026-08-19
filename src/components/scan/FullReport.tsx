'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AnswerLists from './AnswerLists';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import TrendChart from './TrendChart';
import { Compass, FileText, Gauge, ListChecks, MessagesSquare, Search, TrendingUp, Trophy } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY, Head, Meter, Micro, Panel, ProviderMark, Stat, Tint, Verdict, type Tone } from './ui';
import {
  PROVIDER_LABEL,
  type MemoryProvider,
  type ScanPhase1,
  type ScanPhase2,
  type RetrievalResult,
  type TechSignal,
} from '@/lib/scan/types';
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
  const scoredSignals = phase2.signals.filter((s) => s.weight > 0);
  const maxTech = scoredSignals.reduce((sum, s) => sum + s.weight, 0);

  /*
   * The headline is the searching reading.
   *
   * It has been three things: the memory figure alone, then the two pooled,
   * and now this. Each move was aimed at the same fault — a reader meeting a
   * 0% before anyone has told them which question it answers reads it as "we
   * are invisible" and stops there. Pooling fixed the contradiction between
   * the ring and the panel below it, but it left the number the client leads
   * with as an average of two things a buyer never experiences separately.
   *
   * What a buyer actually does today is type into an assistant that searches.
   * So that is the figure on the ring, and the memory reading sits beside it,
   * named, because the gap between the two is the diagnosis and the whole
   * argument for the work: findable but unknown has a different fix from
   * unknown and unfindable.
   *
   * Nothing is hidden by the choice. Both numbers are on this screen, the
   * comparison has its own panel further down, and the audit trail prints
   * every answer of both readings side by side.
   */
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;
  /* Falls back to memory when the searching half did not run — an
     installation with it switched off should show the reading it has, not an
     empty ring. */
  const headlinePct = grounded ? grounded.sovPct : phase1.sovPct;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<FileText size={18} />}
          title={`The full report for ${phase1.brand}`}
          sub={`Measured against ${phase1.domain}. Every figure below traces to a row further down — nothing here is an estimate. The grade averages the three scores under the ring.`}
          chip={phase2.grade}
        />

        <div className="mt-7 grid grid-cols-1 gap-8 border-t border-gray-100 pt-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <div>
            <ScoreRing
              pct={headlinePct}
              label={grounded ? 'Named when they search' : 'Share of voice'}
              caption={
                grounded
                  ? `across ${grounded.totalAnswers} answers with the web open`
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
              <Micro className="text-[#CBD0AC]">Key insight</Micro>
              <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-white">{phase2.keyInsight}</p>
            </Tint>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
              {/* The two readings side by side, in the order they are taken.
                  The ring above pools them; this is where the pair is legible,
                  because the gap between them is the finding — the same brand
                  can be a zero from memory and a third of the answers once the
                  models look, and those have opposite fixes. */}
              {/* The other half of the pair, in the same size as the technical
                  and retrieval scores rather than buried in a sentence. A
                  reader who wants one number has it above; a reader who wants
                  to know what changed when the models looked has it here. */}
              {grounded ? (
                <Stat
                  value={`${phase1.sovPct}%`}
                  label="From memory · not searching"
                  note="What the models already knew, with the web shut"
                />
              ) : (
                <Stat value={`${phase1.sovPct}%`} label="AI share of voice" />
              )}
              <Stat
                value={`${phase2.techScore}`}
                label={`Your site · ${phase2.techScore} of ${maxTech}`}
                note="Whether the crawlers can read you at all"
              />
              <Stat
                value={phase2.serpScore < 0 ? '—' : String(phase2.serpScore)}
                label="Live retrieval / 100"
                note={
                  phase2.serpScore < 0
                    ? 'Not measured on this scan'
                    : 'Whether Perplexity and Google can find you now'
                }
                muted={phase2.serpScore < 0}
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Memory against search, and whether anything can find you now ─── */}
      {phase2.grounded && (
        <GroundedComparison memory={phase1} grounded={phase2.grounded} retrieval={phase2.retrieval} />
      )}

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
      <Rivals phase1={phase1} grounded={grounded ?? undefined} />

      {/* ── What the models actually said ────────────────────────────────── */}
      <Panel>
        <Head
          badge={<MessagesSquare size={18} />}
          title="What the models actually answered"
          sub={`Every list, in the order each model gave it. This is the evidence under every figure above — the leaderboard is these lists added up, and the share of voice is how often ${phase1.brand} appears in them.`}
        />
        <div className="mt-7">
          <AnswerLists phase1={phase1} grounded={phase2.grounded} />
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

        {/* Two columns of rows, not one column of very wide rows. A signal is a
            label, a note and a fraction — around 400px of content that was
            being given the full width of the card, twelve times over. The
            column gap is wide enough that the two fractions do not read as one
            four-column table. */}
        <div className="mt-7 grid grid-cols-1 gap-x-12 lg:grid-cols-2">
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
        {/* In the full report both readings are in; on the free screen only the
            memory half exists, so AuditTrail renders the single column there. */}
        <AuditTrail phase1={phase1} grounded={phase2.grounded} />
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

/** Match key for a company name: case, accents and punctuation all removed.
    The same shape the backend groups on, so "Checkout.com" and "Checkout com"
    resolve to one rival here too.

    `NFD` splits an accented letter into the letter and its mark, and the class
    below then drops the mark along with everything else that is not a letter or
    a digit — so "Diseño" and "Diseno" key alike without a second pass. */
const nameKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '');

/** One company the models named, and everything we know about where it came
    from. Built here rather than read off `phase2.competitors` because the
    server only ever tallied the memory reading — see `Rivals`. */
interface Rival {
  name: string;
  /** Answers that named it, within one reading. */
  mentions: number;
  providers: MemoryProvider[];
  /** Question indices it was named against, ascending. */
  questions: number[];
}

/**
 * Tally one reading's answers into a leaderboard.
 *
 * The backend does exactly this and returns the result as `phase2.competitors`
 * — but only for the memory half, because that is the only half it had when
 * the field was designed. The searching half's answers are right there in
 * `grounded`, and a client asking "recommended instead of me — by whom, from
 * memory or after looking?" cannot be answered with one list. So both are
 * tallied here, by one function, and the two are shown side by side.
 *
 * The brand's own row is excluded by `position`, which is the backend's own
 * verdict on which entry is the brand — it resolves the domain root too, so
 * `kaivastudio.com` counts as `kaiva studio`. Matching the name again in the
 * browser would eventually disagree with the percentage printed above.
 */
function tally(reading: ScanPhase1 | null | undefined, limit = 8): Rival[] {
  if (!reading) return [];

  const brandKey = nameKey(reading.brand);
  const domainKey = nameKey(reading.domain.replace(/\.[a-z.]+$/, ''));

  const acc = new Map<
    string,
    { labels: Map<string, number>; mentions: number; providers: Set<MemoryProvider>; questions: Set<number> }
  >();

  for (const provider of reading.providers) {
    if (provider.error) continue;

    for (const answer of provider.answers) {
      /* Deduplicated within a single answer: a model that says "Stripe … or
         Stripe Connect" has named one company once. */
      const seen = new Set<string>();

      answer.names.forEach((name, i) => {
        /* The brand itself, by the backend's reckoning first and by name as a
           fallback — a list that names the brand twice would otherwise have
           its second mention counted as a rival to itself. */
        if (answer.position === i + 1) return;
        const key = nameKey(name);
        if (!key || key === brandKey || (domainKey && key === domainKey)) return;
        if (seen.has(key)) return;
        seen.add(key);

        let entry = acc.get(key);
        if (!entry) {
          entry = { labels: new Map(), mentions: 0, providers: new Set(), questions: new Set() };
          acc.set(key, entry);
        }
        entry.mentions += 1;
        entry.providers.add(provider.provider);
        entry.questions.add(answer.q);
        const label = name.trim();
        entry.labels.set(label, (entry.labels.get(label) ?? 0) + 1);
      });
    }
  }

  return [...acc.values()]
    .map((e) => ({
      /* Displayed in the spelling the models used most often, so the list reads
         the way a person would write it rather than as a lowercase key. */
      name: [...e.labels.entries()].sort((a, b) => b[1] - a[1])[0][0],
      mentions: e.mentions,
      providers: [...e.providers],
      questions: [...e.questions].sort((a, b) => a - b),
    }))
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Everyone the models named instead — in both readings, with who said it and
 * which question they said it about.
 *
 * Three questions this panel could not answer until now, all asked by the first
 * client to read one carefully:
 *
 *   · **"Recommended in what?"** The leaderboard pools every answer of the run,
 *     which is right when the questions are three ways of asking the same thing
 *     and badly misleading when one of them is not. A studio that asked twice
 *     about web design in Barranquilla and once about free tools to scan a
 *     website got Koombea and Pragma interleaved with Sucuri and VirusTotal.
 *     Every one of those was a real answer to a question they had really asked;
 *     the report simply never said which. Each row now carries its questions.
 *
 *   · **"Three mentions by whom?"** `providers` was in the payload from the
 *     first version and was never rendered. Two models agreeing is a different
 *     finding from one model saying it three times, and the row said neither.
 *
 *   · **"Is this from memory or from searching?"** It was memory, always, and
 *     nothing on the page said so — while the ring at the top of the report
 *     leads with the *searching* figure. So the two readings had different
 *     subjects under one heading. They are two columns now, and the searching
 *     one is usually the more useful of the two: it is the list a buyer using
 *     an assistant today would actually be shown.
 *
 * Two columns from `lg`, and the bar is drawn as a fill behind the row rather
 * than a track beside it. The old row spent its full width on a meter and a
 * right-aligned "3 mentions" — eight names came to eight nearly empty lines
 * down a 1379px card.
 */
function Rivals({ phase1, grounded }: { phase1: ScanPhase1; grounded?: ScanPhase1 }) {
  const memory = tally(phase1);
  const searching = tally(grounded);
  const twoWay = !!grounded && grounded.totalAnswers > 0;

  /* A question is "off on its own" when not one of its companies appears
     against any other question, in either reading. Only worth saying when some
     questions DO agree with each other: two questions that share nothing are
     just two questions, and flagging both says nothing a reader can use. */
  const namesIn = new Map<number, Set<string>>();
  for (const reading of [phase1, grounded]) {
    for (const provider of reading?.providers ?? []) {
      for (const answer of provider.answers) {
        for (const name of answer.names) {
          const key = nameKey(name);
          if (!key) continue;
          if (!namesIn.has(answer.q)) namesIn.set(answer.q, new Set());
          namesIn.get(answer.q)!.add(key);
        }
      }
    }
  }
  const entries = [...namesIn.entries()].filter(([, names]) => names.size > 0);
  const lonely = entries
    .filter(([q, names]) => entries.every(([other, set]) => other === q || ![...names].some((n) => set.has(n))))
    .map(([q]) => q)
    .sort((a, b) => a - b);
  const flagged = entries.length > 2 && lonely.length < entries.length ? lonely : [];

  return (
    <Panel>
      <Head
        badge={<Trophy size={18} />}
        title="Recommended instead of you"
        sub={
          twoWay
            ? `The same question puts a different set of companies in front of a buyer depending on whether the model looks anything up. Both lists are here — the right-hand one is what someone asking an assistant today would be shown.`
            : `Every company the models named across the ${phase1.totalAnswers} answers, ranked by how often.`
        }
      />

      <div className={`mt-7 grid grid-cols-1 gap-8 ${twoWay ? 'lg:grid-cols-2 lg:gap-12' : ''}`}>
        <RivalList
          title={twoWay ? 'When they answer from memory' : 'Named across the run'}
          note={`Out of ${phase1.totalAnswers} answers given with the web shut. This is who the models already associate with your category.`}
          rivals={memory}
          questions={phase1.questions}
        />

        {twoWay && (
          <RivalList
            title="When they search the web"
            note={`Out of ${grounded!.totalAnswers} answers given with the web open. This is who is being put in front of a buyer right now.`}
            rivals={searching}
            questions={phase1.questions}
          />
        )}
      </div>

      {flagged.length > 0 && (
        <Tint edged className="mt-7">
          <p className="text-[12.5px] font-medium leading-relaxed text-[#E7ECD9]">
            <strong className="font-bold text-white">
              {flagged.length === 1
                ? `Question ${flagged[0] + 1} is pulling a different category into these lists.`
                : `Questions ${flagged.map((q) => q + 1).join(' and ')} are pulling different categories into these lists.`}
            </strong>{' '}
            {flagged.length === 1 ? (
              <>
                Not one of the companies the models named for{' '}
                <em>“{phase1.questions[flagged[0]]}”</em> appears against any of your other questions. Those are real
                answers to that question — they are just answers about something else. Ask it on its own scan if you
                want it measured, or drop it and re-run.
              </>
            ) : (
              <>
                Each of them produced a set of companies that overlaps none of the others. Those are real answers to the
                questions as written; they are simply about different categories, and pooling them into one leaderboard
                makes all of them harder to read.
              </>
            )}
          </p>
        </Tint>
      )}
    </Panel>
  );
}

/** One reading's leaderboard. */
function RivalList({
  title,
  note,
  rivals,
  questions,
}: {
  title: string;
  note: string;
  rivals: Rival[];
  questions: string[];
}) {
  /* Scaled against the strongest rival in THIS list, not across both — the two
     readings have different answer counts, and a shared scale would draw the
     searching column short for a reason the reader cannot see. */
  const top = Math.max(1, ...rivals.map((r) => r.mentions));

  return (
    <div>
      <p className="text-[13px] font-bold tracking-tight text-gray-900">{title}</p>
      <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">{note}</p>

      {rivals.length === 0 ? (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3.5 text-[12.5px] font-medium leading-relaxed text-gray-500">
          The models named no companies at all in this reading — which is itself a finding: they had nothing to
          recommend for the questions as written.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-1">
          {rivals.map((r, i) => (
            <li
              key={r.name}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
              /* The fill is the bar. Stops hard rather than fading, so the edge
                 is still readable as a value. */
              style={{
                backgroundImage: `linear-gradient(to right, rgba(203,208,172,.42) ${
                  (r.mentions / top) * 100
                }%, rgba(0,0,0,0) ${(r.mentions / top) * 100}%)`,
              }}
            >
              <Micro className="w-5 shrink-0 text-gray-400">{String(i + 1).padStart(2, '0')}</Micro>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-900">{r.name}</span>

              {/* Who said it. Three bare marks, no labels — the shapes are the
                  legend, and this is the answer to "three mentions by whom". */}
              <span className="flex shrink-0 items-center gap-1">
                {r.providers.map((p) => (
                  <span key={p} title={PROVIDER_LABEL[p]}>
                    <ProviderMark provider={p} />
                  </span>
                ))}
              </span>

              {/* And what it was asked about. The whole question is in the
                  `title`, because two words of it is what a reader needs and
                  eight is what would not fit. */}
              {questions.length > 1 && r.questions.length > 0 && (
                <span className="hidden shrink-0 items-center gap-1 sm:flex">
                  {r.questions.map((q) => (
                    <span
                      key={q}
                      title={questions[q]}
                      className="cursor-help rounded-sm bg-white/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-500"
                    >
                      Q{q + 1}
                    </span>
                  ))}
                </span>
              )}

              <Micro className="w-8 shrink-0 whitespace-nowrap text-right tabular-nums text-gray-500">
                {r.mentions}×
              </Micro>
            </li>
          ))}
        </ol>
      )}
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
function GroundedComparison({
  memory,
  grounded,
  retrieval,
}: {
  memory: ScanPhase1;
  grounded: ScanPhase1;
  /* Perplexity and Google's AI Overview used to have a panel of their own,
     three sections further down, headed "Live retrieval" — and read as an
     appendix nobody could place. They are asking the same question this panel
     asks: can anything find you when it looks? So they belong under it, as the
     third reading rather than as a section on their own. */
  retrieval: RetrievalResult[];
}) {
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

      {/* The two readings and the verdict on the left, the model-by-model
          breakdown on the right. Stacked, this panel ran 680px down a card
          whose right half was empty from the tiles to the bottom — and the
          per-model rows are the detail behind the two figures beside them, so
          reading them together is also the better order. */}
      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-gray-100 sm:grid-cols-2">
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

          <div className="mt-6">
            <Verdict tone={tone}>{verdict}</Verdict>
            <p className="mt-3 max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">{reading}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[12px] font-medium leading-relaxed text-gray-500">
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
                    /* A model that could not be reached is a fault at our end, and
                       the report has to say so in those words. It printed the raw
                       provider error — "every request failed — Provider returned an
                       empty response" — beside two models that answered, which
                       reads as this model having nothing to say about the brand.
                       The detail stays, small and grey, because it is what makes
                       the failure fixable. */
                    <span className="flex flex-col items-start gap-0.5">
                      <span className="text-[12px] font-medium text-gray-500">Could not be reached — not a finding</span>
                      {g.error && <span className="font-mono text-[10px] text-gray-300">{g.error}</span>}
                    </span>
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
        </div>
      </div>

      {/* The third reading, under the two it belongs with. Perplexity and
          Google's AI Overview do not answer from memory at all — they search as
          they answer — so they are the strongest evidence for the right-hand
          number above, and they used to sit three panels away from it. */}
      {retrieval.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-7">
          <p className="text-[13px] font-bold tracking-tight text-gray-900">And the two that only search</p>
          <p className="mt-1.5 max-w-[68ch] text-[12px] font-medium leading-relaxed text-gray-500">
            These never answer from memory, so they measure one thing only: whether your pages are findable and
            quotable <em>today</em>. What they cite is what a buyer is shown.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {retrieval.map((r) => (
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
        </div>
      )}
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
    /* Every row keeps its rule, including the last. `last:border-0` was right
       in one column and wrong in two — it cleared the rule under the final row
       of the right-hand column only, leaving the left column's bottom row
       underlined and the pair looking misaligned. */
    <div className="flex items-start gap-3 border-b border-gray-100 py-3.5">
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
