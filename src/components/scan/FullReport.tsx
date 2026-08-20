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

/**
 * The report screen — step 4 of the scan.
 *
 * ## Read as a board, not as a document
 *
 * It used to run about 5,300px down a laptop screen: eight full-width cards,
 * every one of them a column of prose with the right half of the card empty.
 * Everything in it was true and nearly none of it was *findable* — the owner's
 * verdict on reading one was that there was so much text she could not tell
 * what the numbers were saying.
 *
 * Three moves, in order of how much height they bought:
 *
 *   · **Paired cards.** A comparison of two readings and a five-point trend
 *     line are both roughly 500px of content in a 1,300px-wide card. They sit
 *     side by side, and so do the technical signals and the actions.
 *   · **The evidence folds.** "What the models answered" was 1,918px on its
 *     own — three questions × three models × two readings, all open at once.
 *     Each question is a row that opens; the first is open, so the panel still
 *     shows what is inside it without being the length of the report.
 *   · **Prose cut to captions.** Every panel kept one sentence saying what it
 *     measures. The paragraphs arguing *why* it is measured that way are in
 *     this file's comments, which is where the reasoning belongs.
 *
 * ## Colour
 *
 * On white, olive is #39471D with white type on it. The pale greens (#E7ECD9,
 * #CBD0AC) were doing two jobs they are bad at — bar fills and tint blocks on a
 * white card, where they read as a highlighter mark rather than as a value.
 * They stay on the dark ground, where they are type colours and pass contrast;
 * on the panels a value is drawn dark green on a grey track.
 */
export default function FullReport({ phase1, phase2 }: { phase1: ScanPhase1; phase2: ScanPhase2 }) {
  const scoredSignals = phase2.signals.filter((s) => s.weight > 0);
  const maxTech = scoredSignals.reduce((sum, s) => sum + s.weight, 0);

  /* The searching reading, or nothing. `totalAnswers` rather than mere
     presence: a `grounded` object that came back with no answers in it is a
     reading that was attempted and failed, and the report has to say "not
     measured" rather than draw a ring at 0%. See the indicator pair below. */
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;

  /* Held in a variable because it is placed twice: beside the comparison when
     there is one, full width when there is not. */
  const trend = (
    /* A flex column so the plot can take whatever height the card beside it
       sets. Paired with a 637px comparison, a chart pinned to 180px left a
       fifth of the row empty under it — and a line with more room is a line
       that is easier to read, which is the only thing the panel is for. */
    <Panel className="flex flex-col">
      <Head
        badge={<TrendingUp size={18} />}
        title="Brand knowledge over time"
        /* Named for what the series actually holds. `record_history` writes
           `phase1.sovPct` — the memory reading — and the chart was headed
           "Share of voice over time", which on a report carrying two
           indicators reads as whichever of them the reader had in mind. */
        sub={`Every scan of ${phase1.domain} in this market, oldest first — the no-search reading. AI visibility is measured on every scan but not yet kept as a series.`}
      />
      <div className="mt-6 flex-1">
        <TrendChart history={phase2.history ?? []} brand={phase1.brand} />
      </div>
    </Panel>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── Headline ─────────────────────────────────────────────────────
          Rings left, conclusion right. Stacked — rings, then a paragraph, then
          the tint block, then the two stats — this one card was 741px, and the
          paragraph in the middle of it was the thing a reader had to get past
          to reach the finding. The finding is now beside the figures it is
          about. */}
      <Panel>
        <Head
          badge={<FileText size={18} />}
          title={`The full report for ${phase1.brand}`}
          sub={`Measured against ${phase1.domain}. Two indicators, read separately: whether the models already know you, and whether they find you when they look.`}
          chip={phase2.grade}
        />

        {/* ── The two headline indicators ────────────────────────────────
            Two measurements, side by side, never averaged into one.

            The report used to lead with a single ring. It had been three
            different things in turn — the memory figure, then the two pooled,
            then the searching figure — and each move was an attempt to fix the
            same fault by choosing a different winner, when the fault was that
            there was only one seat.

            They are not two views of one quantity. BRAND KNOWLEDGE is whether
            the model recommends you with nothing to look at: recognition and
            authority inside the model itself, earned off your own site and slow
            to move. AI VISIBILITY is whether it finds and recommends you once
            it searches: digital presence an assistant can discover, which your
            own pages control and which can move in weeks. A brand can be a zero
            on the first and strong on the second — that is the ordinary shape
            for a good small company — and averaging them would hide the one
            fact that decides which work to do. */}
        <div className="mt-6 grid grid-cols-1 gap-8 border-t border-gray-100 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col divide-y divide-gray-100">
            <Indicator
              pct={phase1.sovPct}
              name="Brand knowledge"
              gloss="The models recommend you without looking anything up."
              detail={`Recognition inside the model. ${phase1.totalAnswers} ${
                phase1.totalAnswers === 1 ? 'answer' : 'answers'
              } with the web shut.`}
              className="pb-6"
            />

            {grounded ? (
              <Indicator
                pct={grounded.sovPct}
                name="AI visibility"
                gloss="The models find and recommend you when they search the web."
                detail={`Presence an assistant can discover. ${grounded.totalAnswers} ${
                  grounded.totalAnswers === 1 ? 'answer' : 'answers'
                } with the web open.`}
                className="pt-6"
              />
            ) : (
              /* Not measured is not zero, and a second ring reading 0% beside
                 the first would be a finding we did not take. */
              <div className="pt-6">
                <p className="text-[13px] font-bold tracking-tight text-gray-900">AI visibility — not measured</p>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-gray-500">
                  The searching half of this scan did not run. The figure above answers a different question and cannot
                  stand in for it.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <Tint>
              <Micro className="text-white/55">Key insight</Micro>
              <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-white">{phase2.keyInsight}</p>
            </Tint>

            {/* The two supporting scores. Deliberately smaller than the pair
                on the left: they are evidence for AI visibility, not
                indicators of their own — whether a crawler can read the site,
                and whether a searching engine can surface it right now. */}
            <div className="grid grid-cols-1 divide-y divide-gray-100 border-y border-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <Stat
                value={`${phase2.techScore}`}
                label={`Your site · ${phase2.techScore} of ${maxTech}`}
                note="Whether the crawlers can read you at all"
              />
              <Stat
                value={phase2.serpScore < 0 ? '—' : String(phase2.serpScore)}
                label="Live retrieval / 100"
                note={
                  phase2.serpScore < 0 ? 'Not measured on this scan' : 'Whether Perplexity and Google can find you now'
                }
                muted={phase2.serpScore < 0}
              />
            </div>

            <p className="text-[12px] font-medium leading-relaxed text-gray-500">
              <strong className="font-bold text-gray-900">Never averaged.</strong> The two figures have different causes
              and different fixes — brand knowledge is earned off your own site; AI visibility is what your own pages and
              citations control. The gap between them is the diagnosis, and the panel below reads it.
            </p>
          </div>
        </div>
      </Panel>

      {/* ── The diagnosis, and the series ─────────────────────────────────
          Asked for as a pair, and they belong as one: the comparison says what
          the gap means today, the chart says whether it is moving. Neither
          fills a 1,300px card on its own — the comparison ran 546px with its
          right half empty below the tiles, the chart 443px with a 180px plot in
          it. */}
      {phase2.grounded ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
          <GroundedComparison memory={phase1} grounded={phase2.grounded} />
          {trend}
        </div>
      ) : (
        trend
      )}

      {/* ── Who the models named instead ──────────────────────────────────
          Its own card now. It used to be the tail of a 1,918px answers panel,
          arriving after seventy-two rows of evidence — which is the right
          *order* and the wrong *place*: by the time a reader scrolled to it
          they had left the figures it summarises three screens above.

          Perplexity and the AI Overview ride in the third column. They are
          asking the same question this panel asks — who is being put in front
          of a buyer right now — and they were homeless everywhere else they
          were tried. */}
      <Panel>
        <Rivals phase1={phase1} grounded={grounded ?? undefined} retrieval={phase2.retrieval} />
      </Panel>

      {/* ── Everything the models said, in one place ─────────────────────
          The evidence under every figure above, folded one question to a row.

          The owner's verdict on reading it: this is the panel that shows the
          tool working, because it says ChatGPT recommended this one for that
          question and Claude recommended a different one. That argument is made
          by the first question being open; making it three times over, times
          three models, times two readings, is what turned the panel into a
          third of the page. */}
      <Panel>
        <Head
          badge={<MessagesSquare size={18} />}
          title="What the models answered"
          sub={`Every list, in the order each model gave it. Both indicators above are simply how often ${phase1.brand} appears in these lists — open a question to see it.`}
        />
        <div className="mt-6">
          <AnswerLists phase1={phase1} grounded={phase2.grounded} />
        </div>
      </Panel>

      {/* ── What was checked, and what to do about it ─────────────────────
          The site's signals and the plan that comes out of them, in one row:
          every action below is the remedy for a row on the left, and reading
          them apart was reading a diagnosis on one screen and its prescription
          on the next. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <Head
            badge={<Gauge size={18} />}
            title="Website & technical signals"
            sub={`Checked against ${phase1.domain}. Every point in the score above traces to a row here.`}
            chip={`${phase2.techScore} / ${maxTech}`}
          />

          <div className="mt-5">
            {phase2.signals.map((s) => (
              <SignalRow key={s.id} signal={s} />
            ))}
          </div>
        </Panel>

        <Panel>
          <Head
            badge={<ListChecks size={18} />}
            title="What to do first"
            sub="Ordered by what the scan found, heaviest unmet signal first — not by a fixed script."
          />

          <div className="mt-5 flex flex-col gap-2.5">
            {phase2.actions.map((a, i) => (
              <div key={a.title} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <Micro className="mt-0.5 shrink-0 text-gray-300">{String(i + 1).padStart(2, '0')}</Micro>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <p className="text-[14px] font-bold text-gray-900">{a.title}</p>
                      <Verdict tone={a.priority === 'high' ? 'on' : a.priority === 'medium' ? 'mid' : 'off'}>
                        {a.priority}
                      </Verdict>
                    </div>
                    <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-gray-500">{a.detail}</p>

                    {/* Impact reads on one line with the copy rather than in a
                        column of its own on the right — at half width there is
                        no right-hand column to spare. */}
                    <span className="mt-3 flex items-center gap-2">
                      <Micro className="text-gray-400">Impact</Micro>
                      <span className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, d) => (
                          <span
                            key={d}
                            className={`h-[6px] w-[6px] rounded-full ${d < a.impact ? 'bg-[#39471D]' : 'bg-gray-200'}`}
                          />
                        ))}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Method and close, in one card ─────────────────────────────────
          The audit trail is a collapsed bar and the close is two buttons;
          neither was ever a card's worth of content, and as two cards they were
          280px of padding around 180px of matter. */}
      <Panel>
        {/* In the full report both readings are in; on the free screen only the
            memory half exists, so AuditTrail renders the single column there. */}
        <AuditTrail phase1={phase1} grounded={phase2.grounded} />

        <div className="mt-7 flex flex-col gap-6 border-t border-gray-100 pt-7 lg:flex-row lg:items-center lg:justify-between">
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
 * One of the report's two headline indicators: the ring, its name, and the two
 * sentences that say what it measures.
 *
 * The name and the gloss are the point. A percentage on a ring labelled "share
 * of voice" told a reader nothing they could act on, and the same figure under
 * "Brand knowledge — the models recommend you without looking anything up"
 * tells them both what was measured and, by implication, what would change it.
 *
 * 128px rather than 140: two of these are stacked in half a card now, and the
 * ring is a shape carrying one number — the twelve pixels bought nothing that
 * the figure inside it does not already say.
 */
function Indicator({
  pct,
  name,
  gloss,
  detail,
  className = '',
}: {
  pct: number;
  name: string;
  gloss: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7 ${className}`}>
      <div className="shrink-0">
        <ScoreRing pct={pct} label={name} size={128} />
      </div>
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-[15px] font-bold tracking-tight text-gray-900">{name}</p>
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[#39471D]">{gloss}</p>
        <p className="mt-2 text-[12px] font-medium leading-relaxed text-gray-500">{detail}</p>
      </div>
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
 *     nothing on the page said so. They are two columns now, and the searching
 *     one is usually the more useful of the two: it is the list a buyer using
 *     an assistant today would actually be shown.
 *
 * Three columns at `xl` — memory, searching, and the two engines that only
 * search — because all three answer one question in three ways and the panel is
 * full width.
 */
function Rivals({
  phase1,
  grounded,
  retrieval,
}: {
  phase1: ScanPhase1;
  grounded?: ScanPhase1;
  retrieval: RetrievalResult[];
}) {
  const memory = tally(phase1);
  const searching = tally(grounded);
  const twoWay = !!grounded && grounded.totalAnswers > 0;
  const hasRetrieval = retrieval.length > 0;

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

  const columns = (twoWay ? 2 : 1) + (hasRetrieval ? 1 : 0);

  return (
    <div>
      <Head
        badge={<Trophy size={18} />}
        title="Recommended instead of you"
        sub={
          twoWay
            ? 'The same question puts a different set of companies in front of a buyer depending on whether the model looks anything up, so the two readings are counted separately.'
            : `Every company the models named across the ${phase1.totalAnswers} answers, ranked by how often.`
        }
      />

      <div
        className={`mt-6 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-gray-100 pt-6 ${
          columns === 3 ? 'lg:grid-cols-2 xl:grid-cols-3' : columns === 2 ? 'lg:grid-cols-2' : ''
        }`}
      >
        <RivalList
          title={twoWay ? 'Brand knowledge · no search' : 'Named across the run'}
          note={`Out of ${phase1.totalAnswers} answers with the web shut — who the models already associate with your category.`}
          rivals={memory}
          questions={phase1.questions}
        />

        {twoWay && (
          <RivalList
            title="AI visibility · searching"
            note={`Out of ${grounded!.totalAnswers} answers with the web open — who is being put in front of a buyer right now.`}
            rivals={searching}
            questions={phase1.questions}
          />
        )}

        {hasRetrieval && (
          <div>
            <p className="text-[13px] font-bold tracking-tight text-gray-900">And the two that only search</p>
            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
              These never answer from memory, so they have no brand-knowledge reading at all. They measure one thing:
              whether your pages are findable and quotable <em>today</em>.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              {retrieval.map((r) => (
                <div key={r.provider} className="rounded-xl border border-gray-200 p-4">
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
      </div>

      {flagged.length > 0 && (
        <Tint edged className="mt-7">
          <p className="text-[12.5px] font-medium leading-relaxed text-white/80">
            <strong className="font-bold text-white">
              {flagged.length === 1
                ? `Question ${flagged[0] + 1} is pulling a different category into these lists.`
                : `Questions ${flagged.map((q) => q + 1).join(' and ')} are pulling different categories into these lists.`}
            </strong>{' '}
            {flagged.length === 1 ? (
              <>
                Not one of the companies the models named for <em>“{phase1.questions[flagged[0]]}”</em> appears against
                any of your other questions. Those are real answers to that question — they are just answers about
                something else. Ask it on its own scan if you want it measured, or drop it and re-run.
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
    </div>
  );
}

/**
 * One reading's leaderboard.
 *
 * The row is a name, who said it, and a count — with the value drawn as a rule
 * under the name rather than as a wash behind the whole row. The wash was a
 * pale green rectangle (#CBD0AC at 42%) growing left to right, and at half
 * opacity behind black type it read as a highlighter mark on a list rather than
 * as a measured value; the owner's note on it was simply that she does not use
 * that green. Dark green on a grey track says the same thing with the colour
 * the rest of the console is built from, and the count sits in an olive pill
 * with white type — the same pill the panel headings carry.
 */
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
        <ol className="mt-4 flex flex-col">
          {rivals.map((r, i) => (
            /* Two lines, not one. Everything below used to sit on a single row
               — rank, name, three logos, three question chips and a count —
               and in a column a third of the card wide that left the name
               about 65px to live in: "Vertex Partners" truncated to "Vertex
               P…". The name is the row; the bar and the question chips are
               what it was measured from, and they read fine underneath it. */
            <li key={r.name} className="border-b border-gray-100 py-2.5 last:border-0">
              <span className="flex items-center gap-2.5">
                <Micro className="w-5 shrink-0 text-gray-300">{String(i + 1).padStart(2, '0')}</Micro>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-900">{r.name}</span>

                {/* Who said it. Bare marks, no labels — the shapes are the
                    legend, and this is the answer to "three mentions by
                    whom". */}
                <span className="flex shrink-0 items-center gap-1">
                  {r.providers.map((p) => (
                    <span key={p} title={PROVIDER_LABEL[p]}>
                      <ProviderMark provider={p} />
                    </span>
                  ))}
                </span>

                <span className="shrink-0 rounded-md bg-[#39471D] px-2 py-1 text-[11px] font-bold tabular-nums text-white">
                  {r.mentions}×
                </span>
              </span>

              <span className="mt-2 flex items-center gap-2 pl-[30px]">
                <span className="block h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="block h-full rounded-full bg-[#39471D]"
                    style={{ width: `${(r.mentions / top) * 100}%` }}
                  />
                </span>

                {/* And what it was asked about. The whole question is in the
                    `title`, because two words of it is what a reader needs and
                    eight is what would not fit. */}
                {questions.length > 1 && r.questions.length > 0 && (
                  <span className="flex shrink-0 items-center gap-1">
                    {r.questions.map((q) => (
                      <span
                        key={q}
                        title={questions[q]}
                        className="cursor-help rounded-sm bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-500"
                      >
                        Q{q + 1}
                      </span>
                    ))}
                  </span>
                )}
              </span>
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
 *
 * One column, because the card is now one of two in a row. It was two columns
 * inside a full-width card — the readings on the left, the per-model rows on
 * the right — which is the same content in the same order, simply turned
 * ninety degrees.
 */
function GroundedComparison({ memory, grounded }: { memory: ScanPhase1; grounded: ScanPhase1 }) {
  /* Nothing came back at all — every request failed or the models were all
     skipped. Printing 0% here would be a finding we did not measure. */
  if (grounded.totalAnswers === 0) {
    return (
      <Panel>
        <Head badge={<Search size={18} />} title="When they search the web" />
        <p className="mt-6 rounded-xl bg-gray-50 px-4 py-3.5 text-[13px] font-medium leading-relaxed text-gray-500">
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
        title="Brand knowledge against AI visibility"
        sub={`${
          askedTwice === memory.questions.length ? `The same ${askedTwice} questions` : `${askedTwice} of the ${memory.questions.length} questions`
        }, asked twice: once from memory, once with web search on. Those are different questions about you, and the answers come apart.`}
      />

      <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-gray-100 sm:grid-cols-2">
        <div className="bg-white p-4 sm:p-5">
          <p className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{memory.sovPct}%</p>
          <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">Brand knowledge</p>
          <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
            {memory.totalAnswers} answers, nothing looked up. Reputation, not pages.
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5">
          <p className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{grounded.sovPct}%</p>
          <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">AI visibility</p>
          <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
            {grounded.totalAnswers} answers with the web open. Pages, not reputation.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Verdict tone={tone}>{verdict}</Verdict>
        <p className="mt-3 text-[13px] font-medium leading-relaxed text-gray-500">{reading}</p>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-[12px] font-medium leading-relaxed text-gray-500">
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
                <span className="w-[74px] shrink-0 truncate text-[13px] font-semibold text-gray-900">
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
                    <span className="w-[92px] shrink-0 text-right text-[12px] font-medium tabular-nums text-gray-500">
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
      /* Mid-olive with a white mark, not pale green with a dark one. The three
         states have to read as a ladder, and a #E7ECD9 disc sat lighter than
         the grey "fail" ring below it — so a partial pass looked like the
         weakest of the three. */
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#55672E]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
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
    <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0">
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
