'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AnswerLists from './AnswerLists';
import AuditTrail from './AuditTrail';
import ScoreRing from './ScoreRing';
import TrendChart from './TrendChart';
import { BadgeCheck, BookOpen, Compass, FileText, ListChecks, MessagesSquare, Search, TrendingUp, Trophy } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY, Head, Meter, Micro, Panel, ProviderMark, Stat, Tint, Verdict, type Tone } from './ui';
import {
  PROVIDER_LABEL,
  type AnswerSource,
  type EntityCheck,
  type EntityVerdict,
  type MemoryProvider,
  type Rematch,
  type ScanPhase1,
  type ScanPhase2,
  type ScanQuota,
  type RetrievalResult,
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
 * The closing headline, derived from the report rather than fixed.
 *
 * A closing line that could sit under any report is a line nobody reads, and
 * this one has to carry the whole ask. Ordered by which finding is actually the
 * strongest, not by which panel came last:
 *
 *   1. The sources. "Five websites decide this category and you are on none of
 *      them" is the most specific, most actionable thing this scan produces.
 *   2. A wrong-entity verdict. Rarer, and more urgent than any ranking finding:
 *      a buyer asking about you by name is being shown another company.
 *   3. Absent from both readings — the ordinary zero, said plainly.
 *   4. Everything else.
 */
/**
 * The closing argument, written from this scan.
 *
 * ## Why it is not one fixed paragraph
 *
 * It was, and it converted nobody. "Measuring it is the easy half" is true of
 * every report this tool has ever produced, which is exactly what makes it
 * unreadable: a closing line that could sit under anybody's results is one the
 * reader has already skipped by the time they reach it. There was no reason in
 * it to act, because there was nothing in it about them.
 *
 * So each branch below is a finding this particular scan made, stated as a
 * consequence rather than as a measurement. The order is by what the finding
 * costs the reader, not by how impressive it is to report:
 *
 *   1. **A wrong entity.** Somebody asks for you by name and is handed another
 *      company. Nothing else here matters while that is true, and it is the
 *      only finding on the page costing business today.
 *   2. **Absent from every source.** A handful of pages decide the category and
 *      the reader is on none of them. This is the branch with a named, concrete
 *      list attached, which is what makes it move anybody.
 *   3. **Invisible both ways.** Not known and not found — the one case with no
 *      shortcut to offer, so it does not pretend to have one.
 *   4. **A gap between the readings.** Two different problems depending on
 *      which way it leans, and a different first move for each.
 *   5. **Doing well.** The position erodes, and that is the honest reason to
 *      act. Manufacturing alarm for somebody whose numbers are healthy is how
 *      you lose the reader who could actually afford the engagement.
 *
 * ## On the tone
 *
 * `urgency` decides whether the panel is drawn dark or light, and it is set by
 * what was found rather than by what would sell. A report that shouts at
 * somebody with good results is a report they stop believing, and the whole
 * product rests on being believed.
 */
interface Closing {
  headline: string;
  body: React.ReactNode;
  cta: string;
  urgency: 'high' | 'steady';
}

function closingCase(phase1: ScanPhase1, phase2: ScanPhase2): Closing {
  const external = (phase2.sources ?? []).filter((s) => !s.own);
  const missing = external.filter((s) => !s.brand);
  const mismatch = (phase2.entity ?? []).find((e) => e.verdict === 'mismatch');
  const blank = (phase2.entity ?? []).filter((e) => e.verdict === 'unknown');
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;

  if (mismatch) {
    return {
      urgency: 'high',
      headline: `A buyer asking for ${phase1.brand} by name is being shown someone else.`,
      body: (
        <>
          {PROVIDER_LABEL[mismatch.provider]} answers &ldquo;what is {phase1.brand}&rdquo; by describing a different
          company{mismatch.claimedDomain ? ` at ${mismatch.claimedDomain}` : ''}. That is not a ranking problem and
          publishing more will not fix it: every mention you earn from here is being credited to whoever the model
          thinks you are. It is also the most fixable finding in this report, and the fix has a running order.
        </>
      ),
      cta: 'Get this corrected',
    };
  }

  if (external.length > 0 && missing.length === external.length) {
    return {
      urgency: 'high',
      headline: `${external.length} ${
        external.length === 1 ? 'website decides' : 'websites decide'
      } this category, and ${phase1.brand} is on none of them.`,
      body: (
        <>
          Those are the pages the models opened before answering your questions —{' '}
          {missing
            .slice(0, 3)
            .map((s) => s.host)
            .join(', ')}
          {missing.length > 3 ? ` and ${missing.length - 3} more` : ''}. Your competitors are on them. Until you are
          too, the models have nothing to read that mentions you, and these answers keep coming back exactly as they
          did today. Getting onto those pages is slow, specific work — and it is the work.
        </>
      ),
      cta: 'Talk about getting on these',
    };
  }

  if (phase1.sovPct === 0 && (!grounded || grounded.sovPct === 0)) {
    return {
      urgency: 'high',
      headline: `The models neither know ${phase1.brand} nor find it when they look.`,
      body: (
        <>
          {blank.length > 0
            ? `${blank.length} of the models tested could not say what ${phase1.brand} is even when asked by name. `
            : ''}
          Every buyer who asks one of these assistants for a recommendation in your category is handed a list you are
          not on — not ranked low, absent. It does not correct itself as the models update: they go on learning the
          category from the same sources that do not mention you.
        </>
      ),
      cta: 'Talk to us about fixing this',
    };
  }

  if (grounded) {
    const gap = grounded.sovPct - phase1.sovPct;

    if (gap >= 20) {
      return {
        urgency: 'steady',
        headline: 'The models find you when they search. They do not remember you.',
        body: (
          <>
            {grounded.sovPct}% when searching against {phase1.sovPct}% from memory. Your own pages are working and
            nothing durable has been written about you yet — so you reach the buyer whose assistant searches, and you
            are invisible to the one who gets an answer straight from the model. That second half is the larger one and
            the slower one to move.
          </>
        ),
        cta: 'Talk about closing this gap',
      };
    }

    if (gap <= -20) {
      return {
        urgency: 'high',
        headline: 'The models know you, then stop recommending you once they search.',
        body: (
          <>
            {phase1.sovPct}% from memory against {grounded.sovPct}% when searching. You have the reputation, and the
            pages being retrieved today are not yours. Of everything in this report this is the gap that closes
            fastest — and it is the one costing you buyers right now, because the searching answer is the one a buyer
            actually sees.
          </>
        ),
        cta: 'Talk about closing this gap',
      };
    }
  }

  return {
    urgency: 'steady',
    headline: `${phase1.brand} is in the answers. That is a position to defend.`,
    body: (
      <>
        Being named is not a state you reach and keep. These lists are rebuilt from whatever has been published most
        recently, so a position holds only while something keeps feeding it, and it erodes quietly — the first sign of
        losing one is usually a scan like this, months late. Running this again in a month is the cheapest way to watch
        for it.
      </>
    ),
    cta: 'Talk about holding it',
  };
}

export default function FullReport({
  phase1,
  phase2,
  /* What is left of the free allowance, so the close can say so and offer the
     right next step. Optional: a report re-opened from a link has no live quota
     beside it, and a counter guessed on the client would be worse than none. */
  quota,
  /* Starts a new scan of a competitor, seeded from this one. Optional so the
     report can still be rendered somewhere with no flow around it to hand the
     rematch to — the offer simply does not appear. */
  onRematch,
}: {
  phase1: ScanPhase1;
  phase2: ScanPhase2;
  quota?: ScanQuota | null;
  onRematch?: (rematch: Rematch) => void;
}) {
  /* The closing argument, derived once. It also decides how the last panel is
     drawn — see `closingCase`. */
  const closing = closingCase(phase1, phase2);

  /* The searching reading, or nothing. `totalAnswers` rather than mere
     presence: a `grounded` object that came back with no answers in it is a
     reading that was attempted and failed, and the report has to say "not
     measured" rather than draw a ring at 0%. See the indicator pair below. */
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;

  /* Everything a competitor's scan needs, assembled from this one. The email is
     not here: it belongs to the visitor rather than to the report, and the flow
     around this component is what remembers it. */
  const rematch = onRematch
    ? (competitor: string) =>
        onRematch({
          brand: competitor,
          domain: domainFor(competitor, phase2.sources),
          industry: phase1.industry,
          market: phase1.market,
          questions: phase1.questions,
          email: '',
        })
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<FileText size={18} />}
          title={`The full report for ${phase1.brand}`}
          sub={`Measured against ${phase1.domain}. Two indicators, read separately: whether the models already know you, and whether they find you when they look. Every figure traces to a row further down — nothing here is an estimate.`}
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
            fact that decides which work to do.

            So: two rings, equal weight, each with the sentence that says what
            it measures, and a line underneath stating in as many words that
            they are not added together. */}
        <div className="mt-7 grid grid-cols-1 gap-8 border-t border-gray-100 pt-7 lg:grid-cols-2 lg:gap-12">
          <Indicator
            pct={phase1.sovPct}
            name="Brand knowledge"
            gloss="The models recommend you without looking anything up."
            detail={`Recognition and authority inside the model. Measured across ${phase1.totalAnswers} ${
              phase1.totalAnswers === 1 ? 'answer' : 'answers'
            } given with the web shut.`}
          />

          {grounded ? (
            <Indicator
              pct={grounded.sovPct}
              name="AI visibility"
              gloss="The models find and recommend you when they search the web."
              detail={`Digital presence an assistant can discover. Measured across ${grounded.totalAnswers} ${
                grounded.totalAnswers === 1 ? 'answer' : 'answers'
              } given with the web open.`}
            />
          ) : (
            /* Not measured is not zero, and a second ring reading 0% beside the
               first would be a finding we did not take. */
            <div className="flex flex-col justify-center rounded-xl bg-gray-50 px-5 py-6">
              <p className="text-[13px] font-bold tracking-tight text-gray-900">AI visibility — not measured</p>
              <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-gray-500">
                The searching half of this scan did not run, so there is no reading for whether the models find{' '}
                {phase1.brand} when they look. The figure beside this one answers a different question and cannot stand
                in for it.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 max-w-[86ch] text-[12.5px] font-medium leading-relaxed text-gray-500">
          <strong className="font-bold text-gray-900">These are two measurements, not two halves of one.</strong> They
          are never added together or averaged, because they have different causes and different fixes: brand knowledge
          is earned off your own site and moves slowly; AI visibility is what your own pages and citations control. The
          gap between the two figures is the diagnosis, and the panel below reads it.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <Tint>
            <Micro className="text-[#CBD0AC]">Key insight</Micro>
            <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-white">{phase2.keyInsight}</p>
          </Tint>

          {/* One supporting score, not two. There was a "Your site · 50 of 50"
              beside this, and it was the least defensible figure in the report —
              see the note on the technical panel's removal below. */}
          <div className="border-y border-gray-100">
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
      </Panel>

      {/* ── What the models think you are ────────────────────────────────
          Placed directly under the two indicators, before anything
          comparative, because it is the panel that answers the question those
          two figures raise and cannot settle: a zero above could mean the
          models have never heard of you, or that they know you and reach for
          somebody else, or that your name resolves to a different company
          altogether. Those have three different fixes and one of them is
          urgent. Every other panel in this report is about ranking; this one is
          about whether there is an entity to rank. */}
      {phase2.entity && phase2.entity.length > 0 && (
        <EntityPanel rows={phase2.entity} reading={phase2.entityReading} brand={phase1.brand} domain={phase1.domain} />
      )}

      {/* ── Memory against search, and whether anything can find you now ─── */}
      {phase2.grounded && (
        <GroundedComparison memory={phase1} grounded={phase2.grounded} retrieval={phase2.retrieval} />
      )}

      {/* ── Trend ────────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<TrendingUp size={18} />}
          title="Brand knowledge over time"
          /* Named for what the series actually holds. `record_history` writes
             `phase1.sovPct` — the memory reading — and the chart was headed
             "Share of voice over time", which on a report carrying two
             indicators reads as whichever of them the reader had in mind. The
             AI visibility half is not tracked yet, and the line under the chart
             says so rather than leaving the omission to be discovered. */
          /* The daily rule is stated here rather than left to be discovered.
             Somebody who runs the same brand twice in an evening is doing what
             the report told them to do, and getting one dot back looks like a
             bug — it is reported as one. */
          sub={`Every scan of ${phase1.domain} in this market, oldest first — the no-search reading, which is the half that moves slowly enough for a series to mean anything. One point per day: a second run today updates today's rather than adding to it. A single scan tells you where you stand; only the series tells you whether anything you changed worked. AI visibility is measured on every scan but not yet kept as a series.`}
        />
        <div className="mt-7">
          <TrendChart history={phase2.history ?? []} brand={phase1.brand} />
        </div>
      </Panel>

      {/* ── Everything the models said, in one place ─────────────────────
          This used to be two panels with a third somewhere else: a
          "Recommended instead of you" leaderboard, a "What the models actually
          answered" evidence panel, and Perplexity marooned under "Live
          retrieval" four sections down.

          The owner's verdict on reading it: the answer panel is the one that
          shows the tool working, because it says ChatGPT recommended this one
          for that question and Claude recommended a different one — and the
          leaderboard, arriving first and separately, was an aggregate of
          evidence the reader had not seen yet. So the evidence leads, the
          aggregate follows it as a summary, and Perplexity sits with the rest
          rather than in a section nobody could place.

          Perplexity keeps its own shape inside the panel. It searches as it
          answers and returns a verdict and its sources, not a ranked list of
          eight companies — so it gets a row that says what it found, not a
          column pretending to be a fourth model with a leaderboard. */}
      <Panel>
        <Head
          badge={<MessagesSquare size={18} />}
          title="What the models answered"
          sub={`Every list, in the order each model gave it, question by question. This is the evidence under every figure above: both indicators are simply how often ${phase1.brand} appears in these lists.`}
        />
        <div className="mt-7">
          <AnswerLists phase1={phase1} grounded={phase2.grounded} />
        </div>

        {phase2.retrieval.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-7">
            <p className="text-[13px] font-bold tracking-tight text-gray-900">And the two that only search</p>
            <p className="mt-1.5 max-w-[74ch] text-[12px] font-medium leading-relaxed text-gray-500">
              These never answer from memory, so they have no brand-knowledge reading at all — they measure one thing
              only: whether your pages are findable and quotable <em>today</em>. They answer the scan as a whole rather
              than question by question, which is why they are a verdict and a list of sources here rather than a
              ranking above.
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
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
          </div>
        )}

        {/* The aggregate, after the evidence rather than before it. */}
        <div className="mt-8 border-t border-gray-100 pt-7">
          <Rivals phase1={phase1} grounded={grounded ?? undefined} onRematch={rematch} quota={quota} />
        </div>
      </Panel>

      {/* ── Where those answers were read from ────────────────────────────
          Straight after the leaderboard, because it is the answer to the
          question the leaderboard raises and cannot settle: not "who is being
          recommended" but "off the back of what". Every other panel in this
          report is a measurement of the brand; this one is a description of the
          category, and it is the only one that names things a person can go and
          do this week. */}
      {phase2.sources && phase2.sources.length > 0 && (
        <SourcesPanel sources={phase2.sources} brand={phase1.brand} domain={phase1.domain} />
      )}

      {/* ── Technical readiness — removed ─────────────────────────────────
       *
       * There was a "Website & technical signals" panel here, twelve rows of
       * HTTPS, robots.txt, schema markup and sitemap dates, with a score out of
       * fifty. It is gone, for two separate reasons that happened to land at
       * the same time.
       *
       * **It could report a falsehood with total confidence.** When the site
       * could not be fetched at all — a WAF refusing our server, an outbound
       * block on the host — every content row correctly said "not scored", but
       * the robots.txt row could not tell "there is no robots.txt" from "we
       * never got a reply", and its no-robots branch is a *pass* worth 25
       * points. So an unreachable site scored 25/25 on one row, picked up the
       * other 25 from citations, and printed **50 / 50** at the top of a panel
       * in which everything else said NOT SCORED. That was reported from a scan
       * of allianz.com, a site that plainly has HTTPS and a robots.txt. A
       * reader who catches one panel being confidently wrong is right to
       * discount the rest, and the rest is the part that took the money.
       *
       * **It is not what this is for.** The service being sold is about what
       * the models say, and a technical audit of a website is a different
       * product with different buyers. Keeping it meant a scan spending its
       * time on checks nobody here intends to act on, and it pulled the plan
       * below towards "add Organization schema" and away from the answers.
       *
       * The fix for the first reason on its own would have been to tell an
       * unreachable fetch apart from a missing file. The second reason is why
       * that fix was not worth making. `Thallo_Vis_Tech` still exists in the
       * plugin and is no longer called by the runner.
       */}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<ListChecks size={18} />}
          title="What to do first"
          sub="Ordered by what the models actually said — the sources you are missing from, the names that resolve to somebody else, the gap between the two readings. Not a fixed script, and no longer a website checklist."
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

      {/* ── Close ──────────────────────────────────────────────────────────
          The headline is written from the report rather than fixed, because a
          closing line that could sit under any report is a line nobody reads.
          The strongest finding this scan produces is almost always the source
          table — a handful of websites decide the category and the reader is on
          none of them — so when that panel ran, it supplies the sentence. */}
      {/* Drawn dark when the finding warrants it. `!bg` because `Panel` sets
          `bg-white` itself and two utilities of equal specificity are decided
          by stylesheet order rather than by the order they appear here — which
          is a coin toss, and this one may not be left to chance. */}
      <Panel className={closing.urgency === 'high' ? '!bg-[#39471D]' : ''}>
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 lg:max-w-[62ch]">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
                closing.urgency === 'high' ? 'bg-white/10' : 'bg-[#F4F6EE]'
              }`}
            >
              <Compass size={14} className={closing.urgency === 'high' ? 'text-[#CBD0AC]' : 'text-[#39471D]'} />
              <Micro className={closing.urgency === 'high' ? 'text-[#CBD0AC]' : 'text-[#39471D]'}>
                What this means for you
              </Micro>
            </span>

            {/* Bigger than any other heading in the report, on purpose. This is
                the one paragraph written about this reader rather than about
                the method, and it used to be set at the same weight as
                "Structured FAQ schema". */}
            <h3
              className={`mt-4 text-[22px] font-bold leading-[1.25] tracking-tight sm:text-[26px] ${
                closing.urgency === 'high' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {closing.headline}
            </h3>

            <p
              className={`mt-4 text-[14px] font-medium leading-relaxed ${
                closing.urgency === 'high' ? 'text-[#E7ECD9]' : 'text-gray-500'
              }`}
            >
              {closing.body}
            </p>

            <p
              className={`mt-4 text-[13px] font-medium leading-relaxed ${
                closing.urgency === 'high' ? 'text-[#CBD0AC]' : 'text-gray-400'
              }`}
            >
              This scan is the diagnosis, and it is the free half. The other half is the work that moves these
              numbers — getting named in the roundups, the comparisons and the threads these models actually open —
              and it is the slowest thing on the list to change, which is why it is worth starting before your
              competitors finish.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            <a
              href={`${BASE}/contact/`}
              className={
                closing.urgency === 'high'
                  ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-[15px] font-bold text-[#39471D] transition-colors hover:bg-[#E7ECD9]'
                  : `${BTN_PRIMARY} px-7 py-4 text-[15px]`
              }
            >
              {closing.cta} <ArrowUpRight className="text-[12px]" />
            </a>
            <a
              href={`${BASE}/thallo-ai/scan/`}
              className={
                closing.urgency === 'high'
                  ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-[13px] font-semibold text-white transition-colors hover:border-white/60'
                  : BTN_SECONDARY
              }
            >
              {quota && quota.remaining > 0
                ? `Run scan ${quota.limit - quota.remaining + 1} of ${quota.limit}`
                : 'Run another scan'}
            </a>
            <span
              className={`max-w-[26ch] text-center text-[11.5px] font-medium leading-relaxed ${
                closing.urgency === 'high' ? 'text-[#CBD0AC]' : 'text-gray-400'
              }`}
            >
              A 30-minute call. We walk through this report and what we would do first.
            </span>
          </div>
        </div>

        {/* What is left, and what it is worth spending on. A visitor who has
            just read a report is the one moment they know what a second scan
            would tell them — and the two genuinely useful second scans are a
            competitor and the same brand a month later, so say which. */}
        {quota && (
          <p
            className={`mt-6 border-t pt-5 text-[12.5px] font-medium leading-relaxed ${
              closing.urgency === 'high' ? 'border-white/15 text-[#CBD0AC]' : 'border-gray-100 text-gray-500'
            }`}
          >
            {quota.remaining > 0 ? (
              <>
                <strong className={`font-bold ${closing.urgency === 'high' ? 'text-white' : 'text-gray-900'}`}>
                  {quota.remaining} of your {quota.limit} free {quota.remaining === 1 ? 'scan is' : 'scans are'} left.
                </strong>{' '}
                {/* Deliberately not a second pitch for the competitor scan —
                    that offer sits on the leaderboard, where the question
                    actually occurs to the reader. This one adds the other use
                    for a spare scan, which nothing else on the page mentions. */}
                Besides a competitor — the button on the leaderboard runs one — the other one worth spending is{' '}
                {phase1.brand} again in about a month, which is the first run that puts a second point on the chart
                above.
              </>
            ) : (
              <>
                <strong className={`font-bold ${closing.urgency === 'high' ? 'text-white' : 'text-gray-900'}`}>
                  That was your last free scan.
                </strong>{' '}
                {quota.reason ??
                  'Book an audit and we will run the full question set against your category, with the sources behind every answer.'}
              </>
            )}
          </p>
        )}
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
 */
function Indicator({
  pct,
  name,
  gloss,
  detail,
}: {
  pct: number;
  name: string;
  gloss: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-7">
      <div className="shrink-0">
        <ScoreRing pct={pct} label={name} size={140} />
      </div>
      <div className="min-w-0 text-center sm:pt-3 sm:text-left">
        <p className="text-[15px] font-bold tracking-tight text-gray-900">{name}</p>
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[#39471D]">{gloss}</p>
        <p className="mt-2 text-[12px] font-medium leading-relaxed text-gray-500">{detail}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Where the answers were read from
// ---------------------------------------------------------------------------

/**
 * The pages the searching models opened before they answered, by host.
 *
 * ## What the reader is meant to take from it
 *
 * One sentence, and it is usually the same sentence: *a handful of websites
 * decide this category, and you are on none of them.* That is a different kind
 * of statement from a percentage. A share of answer says where you stand; this
 * says what the ground is made of, and every row is a place a person can
 * actually go — a roundup to be included in, a directory to be reviewed on, a
 * publication to be quoted in.
 *
 * ## Why the brand's own domain sits at the bottom with its own treatment
 *
 * Because the most common shape of this table is five third-party sources
 * carrying the competitors and one row — your own website — carrying you. Sorted
 * purely by frequency, a company's own site can land at the top and read as
 * reassurance when the finding is the opposite of reassuring. Pinned last and
 * marked, it reads as what it is: the only source vouching for you is you.
 */
function SourcesPanel({ sources, brand, domain }: { sources: AnswerSource[]; brand: string; domain: string }) {
  const external = sources.filter((s) => !s.own);
  const inNone = external.length > 0 && !external.some((s) => s.brand);

  return (
    <Panel>
      <Head
        badge={<BookOpen size={18} />}
        title="Where these answers were read from"
        sub={`When the models searched, these are the pages they opened before answering — and who each page put in front of the buyer. This is the shortest description available of what earns a recommendation in your category.`}
        chip={`${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`}
      />

      {/* A table, not cards. Five hosts with a count and a name list is tabular
          data, and the one question a reader asks of it — "which of these carry
          my competitors and not me" — is a column scan. Its own horizontal
          scroll container so a long host name cannot make the page scroll. */}
      <div className="mt-7 -mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr>
              {['Source the models opened', 'Named in those answers', 'Times'].map((h, i) => (
                <th
                  key={h}
                  className={`border-b border-gray-100 pb-3 pr-4 text-[10.5px] font-bold uppercase tracking-[.1em] text-gray-400 ${
                    i === 2 ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.host} className={s.own ? 'bg-[#FBF3EF]' : undefined}>
                <td className="border-b border-gray-100 py-3.5 pr-4 align-top">
                  <span className="font-mono text-[12.5px] font-semibold text-gray-900">{s.host}</span>
                  {s.own && (
                    <span className="ml-2 rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#A9502F]">
                      Your own site
                    </span>
                  )}
                </td>
                <td className="border-b border-gray-100 py-3.5 pr-4 align-top">
                  <span className="flex flex-wrap gap-1.5">
                    {s.brand && (
                      <span className="rounded-sm bg-[#39471D] px-2 py-0.5 text-[11px] font-bold text-white">
                        {brand}
                      </span>
                    )}
                    {s.names.map((n) => (
                      <span key={n} className="rounded-sm bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        {n}
                      </span>
                    ))}
                    {!s.brand && s.names.length === 0 && (
                      <span className="text-[11px] font-medium text-gray-300">no company named</span>
                    )}
                  </span>
                </td>
                <td className="border-b border-gray-100 py-3.5 text-right align-top">
                  <Micro className="tabular-nums text-gray-500">{s.times}×</Micro>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-[86ch] text-[13px] font-medium leading-relaxed text-gray-500">
        <strong className="font-bold text-gray-900">Reading:</strong>{' '}
        {external.length === 0 ? (
          <>
            Every page the models opened was on {domain} itself. Nothing outside your own domain was consulted, which
            means there is nothing outside your own domain for a model to weigh — and a model with only your own
            marketing to go on can find you and has no reason to recommend you.
          </>
        ) : inNone ? (
          <>
            {external.length} {external.length === 1 ? 'source' : 'sources'} outside anybody&rsquo;s own domain carried
            these answers, and {brand} appears in none of them. That is the gap in one line: the companies named
            instead of you are not better written about on their own websites, they are written about somewhere else.
          </>
        ) : (
          <>
            {brand} appears in {external.filter((s) => s.brand).length} of the {external.length} third-party sources
            these answers were read from. Those are the pages carrying you into an answer — and the ones without you
            are the shortlist of where to be next.
          </>
        )}
      </p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Entity accuracy
// ---------------------------------------------------------------------------

const ENTITY_TONE: Record<EntityVerdict, Tone> = {
  resolved: 'on',
  partial: 'mid',
  mismatch: 'off',
  unknown: 'off',
  unavailable: 'off',
};

const ENTITY_LABEL: Record<EntityVerdict, string> = {
  resolved: 'Resolved',
  partial: 'Partial',
  mismatch: 'Wrong company',
  unknown: 'Not recognised',
  unavailable: 'Not measured',
};

/**
 * The direct question — "what is this company, and who does it serve?" — put to
 * each model by name.
 *
 * ## Why the report needed this
 *
 * Nearly every brand that runs this scan comes back at 0%, and a zero tells its
 * story exactly once. It confirms absence and leaves the reader with nothing to
 * do about it. Worse, it flattens three different situations into one figure:
 * the model has never heard of you, the model knows you and cannot say who you
 * are for, and the model resolves your name to somebody else's company. The
 * last of those is not absence at all — it is a buyer asking about you by name
 * and being handed a different business — and it is the one worth interrupting
 * a report to say.
 *
 * ## Why the model's own words are printed
 *
 * A verdict on its own is an assertion. The sentence the model actually
 * returned is what makes it checkable, and on a `mismatch` the website it named
 * is printed too — that string is the whole evidence for the accusation, and an
 * accusation the reader cannot verify is worse than no panel at all.
 */
function EntityPanel({
  rows,
  reading,
  brand,
  domain,
}: {
  rows: EntityCheck[];
  reading?: string;
  brand: string;
  domain: string;
}) {
  return (
    <Panel>
      <Head
        badge={<BadgeCheck size={18} />}
        title={`What the models think ${brand} is`}
        sub={`Asked directly, by name, in each model — the one question in this scan that mentions you, because it is the only one that is not about ranking. Being absent is one problem. Being resolved as a different company is a different one, and the figures above cannot tell them apart.`}
      />

      <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        {rows.map((row) => (
          <div key={row.provider} className="min-w-0">
            <div className="flex items-center gap-2.5">
              <ProviderMark provider={row.provider} />
              <span className="flex-1 truncate text-[13px] font-bold text-gray-900">
                {PROVIDER_LABEL[row.provider]}
              </span>
              <Verdict tone={ENTITY_TONE[row.verdict]}>{ENTITY_LABEL[row.verdict]}</Verdict>
            </div>

            {row.verdict === 'unavailable' ? (
              /* A model we could not reach is a fault at our end, said in those
                 words. The raw message stays, small and grey, because it is what
                 makes the failure fixable — but it must not read as a finding
                 about the brand, which is exactly how a bare provider error
                 printed beside two working columns reads. */
              <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-gray-500">
                Could not be reached — not a finding about {brand}.
                {row.error && <span className="mt-1 block font-mono text-[10px] text-gray-300">{row.error}</span>}
              </p>
            ) : row.verdict === 'unknown' ? (
              <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-gray-500">
                Asked directly, it says it does not recognise the name. That is the honest floor: a model can only know
                what it has read somewhere other than your own site.
              </p>
            ) : (
              <>
                <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-gray-500">{row.what}</p>

                {row.verdict === 'mismatch' && row.claimedDomain && (
                  /* The evidence, in the model's own words rather than ours.
                     "It thinks you are somebody else" is an accusation; naming
                     the website it gave makes it a fact the reader can open in
                     a new tab and check in four seconds. */
                  <p className="mt-2.5 rounded-lg bg-[#FBF3EF] px-3 py-2.5 text-[12px] font-medium leading-relaxed text-[#8A4126]">
                    It gives the website as <span className="font-mono font-bold">{row.claimedDomain}</span>, not{' '}
                    <span className="font-mono font-bold">{domain}</span>. A buyer asking about you by name is being
                    shown that company.
                  </p>
                )}

                {row.verdict === 'partial' && (
                  <p className="mt-2.5 text-[12px] font-medium leading-relaxed text-gray-400">
                    It cannot say who you are for — no segment, no company size, no use case. A model that cannot state
                    your buyer cannot match you to one.
                  </p>
                )}

                {row.verdict === 'resolved' && row.serves && (
                  <p className="mt-2.5 text-[12px] font-medium leading-relaxed text-gray-400">
                    <span className="font-semibold text-gray-500">Serves:</span> {row.serves}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {reading && (
        <>
          <div className="mt-7 border-t border-gray-100 pt-6" />
          <p className="max-w-[86ch] text-[13px] font-medium leading-relaxed text-gray-500">
            <strong className="font-bold text-gray-900">Reading:</strong> {reading}
          </p>
        </>
      )}
    </Panel>
  );
}

/**
 * A competitor's website, but only when the scan already found it.
 *
 * The setup screen needs a domain, and the temptation is to build one from the
 * name — `northmark.com` — which is wrong often enough to be dangerous rather
 * than merely unhelpful. The brand match keys on the domain root, so a scan run
 * against the wrong website reports a company as absent from answers that named
 * it, produces a confident 0%, and looks exactly like a real measurement. That
 * is the one failure this whole report exists to avoid, and it would be us
 * causing it.
 *
 * What is safe is a host the models themselves opened whose own name matches the
 * competitor's. If a searching model read `northmark.com` while answering, that
 * is evidence rather than a guess — and the visitor sees it in an editable field
 * with a line saying where it came from.
 *
 * Returns an empty string when there is no such evidence, and the field starts
 * blank. Typing a domain takes four seconds; discovering three weeks later that
 * a report measured the wrong company does not.
 */
function domainFor(competitor: string, sources?: AnswerSource[]): string {
  const key = nameKey(competitor);
  if (!key || !sources) return '';

  const match = sources.find((s) => !s.own && nameKey(s.host.replace(/\.[a-z.]+$/, '')) === key);

  return match ? match.host : '';
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
function Rivals({
  phase1,
  grounded,
  onRematch,
  quota,
}: {
  phase1: ScanPhase1;
  grounded?: ScanPhase1;
  /** Starts a fresh scan of this company, seeded from the one just read. */
  onRematch?: (competitor: string) => void;
  quota?: ScanQuota | null;
}) {
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
    <div>
      <div className="flex items-start gap-3">
        <Trophy size={18} className="mt-0.5 shrink-0 text-[#39471D]" />
        <div>
          <p className="text-[13px] font-bold tracking-tight text-gray-900">Recommended instead of you</p>
          <p className="mt-1.5 max-w-[74ch] text-[12px] font-medium leading-relaxed text-gray-500">
            {twoWay
              ? 'The companies the models named when they answered your questions, most-named first. There are two lists because there are two answers: on the left, the names a model gives from memory; on the right, the names it gives after searching the web. Those are rarely the same, so they are never added together.'
              : `Every company the models named across the ${phase1.totalAnswers} answers, ranked by how often.`}
          </p>
        </div>
      </div>

      {/* Named in both readings.
       *
       * The intersection is the finding, and it was invisible: two lists side
       * by side, and the reader left to run their eye between them to work out
       * which names are on both. A company named only from memory has a
       * reputation and no current pages; a company named only when searching
       * has pages and no reputation. A company on both is the benchmark — it
       * has cleared the bar in both directions, and it is the shortest answer
       * to "who am I actually competing with here". */}
      {(() => {
        const bothWays = twoWay
          ? new Set(
              memory
                .map((r) => nameKey(r.name))
                .filter((k) => searching.some((s) => nameKey(s.name) === k))
            )
          : new Set<string>();

        return (
          <>
            <div className={`mt-7 grid grid-cols-1 gap-8 ${twoWay ? 'lg:grid-cols-2 lg:gap-12' : ''}`}>
              <RivalList
                title={twoWay ? 'Brand knowledge · no search' : 'Named across the run'}
                note={`Out of ${phase1.totalAnswers} answers given with the web shut. This is who the models already associate with your category.`}
                rivals={memory}
                questions={phase1.questions}
                bothWays={bothWays}
              />

              {twoWay && (
                <RivalList
                  title="AI visibility · searching"
                  note={`Out of ${grounded!.totalAnswers} answers given with the web open. This is who is being put in front of a buyer right now.`}
                  rivals={searching}
                  questions={phase1.questions}
                  bothWays={bothWays}
                />
              )}
            </div>

            {bothWays.size > 0 && (
              <p className="mt-5 max-w-[86ch] text-[12.5px] font-medium leading-relaxed text-gray-500">
                <strong className="font-bold text-gray-900">
                  {bothWays.size} {bothWays.size === 1 ? 'company is' : 'companies are'} named both ways.
                </strong>{' '}
                Those are the ones that clear the bar in both directions — the models already know them and still pick
                them after searching — which makes them the benchmark rather than the two lists taken separately. A
                name in only one column has half the problem you do.
              </p>
            )}

            {onRematch && (
              <RematchOffer
                rivals={rankRivals(memory, searching, bothWays)}
                onRematch={onRematch}
                quota={quota}
                brand={phase1.brand}
              />
            )}
          </>
        );
      })()}

      {flagged.length > 0 && (
        <Tint edged className="mt-7">
          <p className="text-[12.5px] font-medium leading-relaxed text-[#E7ECD9]">
            <strong className="font-bold text-white">
              {flagged.length === 1
                ? `Question ${flagged[0] + 1} is about a different market from the rest of your scan.`
                : `Questions ${flagged.map((q) => q + 1).join(' and ')} are each about a different market.`}
            </strong>{' '}
            {flagged.length === 1 ? (
              <>
                The models named a completely different set of companies for{' '}
                <em>“{phase1.questions[flagged[0]]}”</em> — not one of them comes up anywhere in your other questions.
                Nothing has gone wrong: those are real answers to a real question. It is just a different competitive
                set, and putting it in the same lists as the others makes all of them harder to read. Give that
                question a scan of its own, or swap it for one closer to the rest and run this scan again.
              </>
            ) : (
              <>
                Each of them brought back companies that appear in none of the other questions. Nothing has gone wrong —
                they are real answers — but they describe separate markets, and one set of lists cannot rank three
                markets at once. Give each of them a scan of its own, or bring the questions closer together and run
                this scan again.
              </>
            )}
          </p>
        </Tint>
      )}
    </div>
  );
}

/**
 * Which competitor to offer first, and in what order after that.
 *
 * Not simply the top of the memory list. The company worth measuring yourself
 * against is the one clearing the bar in **both** readings — known to the models
 * *and* still picked after they search — because a name in only one column has a
 * different problem from the reader and comparing against it teaches less. So
 * the both-ways set ranks first, ordered by their standing when the models
 * search, which is the list a buyer is actually shown today.
 *
 * Falls back to the searching leaderboard, then to memory, so a scan where only
 * one reading ran still has something to offer.
 */
function rankRivals(memory: Rival[], searching: Rival[], bothWays: Set<string>): string[] {
  const ordered = [...(searching.length ? searching : memory)];

  ordered.sort((a, b) => {
    const aBoth = bothWays.has(nameKey(a.name));
    const bBoth = bothWays.has(nameKey(b.name));
    if (aBoth !== bBoth) return aBoth ? -1 : 1;
    return b.mentions - a.mentions;
  });

  /* Deduplicated across the two readings — the same company reached through
     different lists is one company, and offering it twice reads as a bug. */
  const seen = new Set<string>();
  const out: string[] = [];

  for (const rival of [...ordered, ...memory]) {
    const key = nameKey(rival.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(rival.name);
  }

  return out;
}

/**
 * "Run these same questions against Northmark."
 *
 * ## Why this belongs here and not in the closing panel
 *
 * The leaderboard is the moment the question occurs to the reader. They have
 * just been shown four companies being recommended in their place, and the next
 * thought is always the same one — *how do they score?* Until now answering it
 * meant scrolling back to an empty form and retyping three questions from
 * memory, which is enough friction that almost nobody did, and the second free
 * scan went unused. A competitor's report is also the single most persuasive
 * thing this tool can produce, because it turns an abstract score into a
 * comparison.
 *
 * ## Why one button and then chips
 *
 * A button on every row would put a call to action on twelve lines of a table
 * whose job is to be read. One prominent offer for the company actually worth
 * measuring against — see `rankRivals` — and the rest as quiet chips for
 * somebody who has a different rival in mind.
 *
 * ## When there is nothing left to spend
 *
 * The offer is not shown greyed out. A visitor with no scans left is the most
 * interested person on the page, and the right thing to hand them is the same
 * invitation the close makes rather than a disabled button explaining what they
 * cannot have.
 */
function RematchOffer({
  rivals,
  onRematch,
  quota,
  brand,
}: {
  rivals: string[];
  onRematch: (competitor: string) => void;
  quota?: ScanQuota | null;
  brand: string;
}) {
  if (!rivals.length) return null;

  const [leader, ...rest] = rivals;
  const spent = !!quota && quota.remaining <= 0;

  return (
    <div className="mt-7 rounded-xl border border-gray-200 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-bold tracking-tight text-gray-900">
            Now run the same questions against one of them
          </p>
          <p className="mt-1.5 max-w-[70ch] text-[12px] font-medium leading-relaxed text-gray-500">
            {spent ? (
              <>
                A rival&rsquo;s report is the same three questions with their name in the matcher instead of yours, and
                it is the fastest way to see whether {brand} is behind or the whole category is.
              </>
            ) : (
              <>
                Same three questions, same category, same market — so the two reports line up row for row. You will need
                their website; everything else carries over.
              </>
            )}
          </p>
        </div>

        {spent ? (
          <a href={`${BASE}/contact/`} className={`${BTN_PRIMARY} shrink-0`}>
            Book an audit <ArrowUpRight className="text-[12px]" />
          </a>
        ) : (
          <button type="button" onClick={() => onRematch(leader)} className={`${BTN_PRIMARY} shrink-0`}>
            Run these same questions against {leader}
          </button>
        )}
      </div>

      {!spent && rest.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          <Micro className="text-gray-400">Or</Micro>
          {rest.slice(0, 5).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onRematch(name)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-600 transition-colors hover:border-[#39471D] hover:text-[#39471D]"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** One reading's leaderboard. */
function RivalList({
  title,
  note,
  rivals,
  questions,
  bothWays,
}: {
  title: string;
  note: string;
  rivals: Rival[];
  questions: string[];
  /** Normalised names present in both readings. Empty when only one ran. */
  bothWays: Set<string>;
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

              {/* The intersection, marked on the row rather than left to the
                  reader's eye travelling between two columns. */}
              {bothWays.has(nameKey(r.name)) && (
                <span className="hidden shrink-0 rounded-sm border border-[#39471D] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[.08em] text-[#39471D] md:inline">
                  Both ways
                </span>
              )}

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
        title="Brand knowledge against AI visibility"
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
              <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">Brand knowledge</p>
              <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
                Out of {memory.totalAnswers} answers given without looking anything up. This is whether the models already
                know {memory.brand} — reputation, not pages.
              </p>
            </div>
        <div className="bg-white p-4 sm:p-5">
          <p className="text-3xl font-bold leading-none tracking-tight text-[#39471D]">{grounded.sovPct}%</p>
          <p className="mt-2.5 text-[13px] font-bold tracking-tight text-gray-900">AI visibility</p>
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

      {/* Perplexity and the AI Overview briefly lived here. They have moved in
          with the answers, where the owner could actually place them: this
          panel is a comparison of two readings, and a third thing that is
          neither of them read as a footnote wherever it was put. */}
      {false && (
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

