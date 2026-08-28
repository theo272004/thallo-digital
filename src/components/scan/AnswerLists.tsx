'use client';

/**
 * What each model actually answered, question by question.
 *
 * The report could say "0% share of voice" and "Sucuri, Qualys, VirusTotal are
 * recommended instead of you" without ever showing the one thing that makes
 * both legible: the list each model gave, in the order it gave it. A reader who
 * cannot see that list has to take the aggregate on trust — and when the
 * aggregate looks strange, as it does whenever one question is about a
 * different category from the others, they conclude the tool is broken rather
 * than that the question was.
 *
 * That was a real report, on a real scan: a web studio in Barranquilla asked
 * two questions about web design and one about free tools to scan a website,
 * and the leaderboard came back a blend of Colombian agencies and malware
 * scanners. Nothing had gone wrong. Nothing on the page said so either.
 *
 * The data for this was already in the payload and was being thrown away —
 * `Answer.names` carries up to eight companies per answer, in rank order, and
 * the audit trail rendered them as a dash or a `#3`. So this costs no extra
 * call, no backend change and no money.
 */

import React from 'react';
import { Micro, NotedLabel, ProviderMark, Verdict } from './ui';
import { PROVIDER_LABEL, type Answer, type ScanPhase1 } from '@/lib/scan/types';

/**
 * The two readings, and how to say what each one is to somebody who has never
 * heard of either.
 *
 * ## Why `empty` is three different sentences
 *
 * "Named no companies — the model said it did not know any for this question"
 * was one sentence for both readings, and under the no-search column it is the
 * single most disbelieved line in the report. The reader can open the same
 * model in another tab, type their brand, and watch it answer — so a report
 * saying the model named nobody is, as far as they can tell, simply wrong, and
 * a reader who catches the tool being wrong once stops reading the rest.
 *
 * It is not wrong. It is the measurement: with the web shut the model can only
 * answer from what it absorbed in training, and not knowing your category from
 * memory is exactly the finding — one that vanishes the moment it is allowed to
 * search, which is the column immediately to the right. That entire explanation
 * has to be in the sentence itself, because the moment of disbelief is not a
 * moment anybody spends clicking things.
 *
 * ## Why the label carries a note as well
 *
 * `NotedLabel` in `ui.tsx`. "Brand knowledge · no search" is our vocabulary; it
 * earns its place in the report — see the panel that refuses to average the two
 * — but it is jargon on first contact, and it is printed here six times per
 * question with nothing around it to define it.
 */
type Mode = 'memory' | 'web' | 'single';

const READINGS: Record<Mode, { label: string; note: React.ReactNode; empty: string }> = {
  memory: {
    label: 'Brand knowledge · no search',
    note: (
      <>
        <strong className="font-bold">Asked with the model&rsquo;s internet access switched off.</strong> It could only
        answer from what it already knows, so this is reputation rather than pages: whether the model has learned who
        belongs in your category. A model can draw a blank here and still find you in a second — that is the reading
        directly below.
      </>
    ),
    empty:
      'Named no companies. With the web switched off this model could not think of anyone in this category — which is about what it has learned, not about whether these companies exist. Compare it with the searching reading below.',
  },
  web: {
    label: 'AI visibility · searching',
    note: (
      <>
        <strong className="font-bold">The same question, with the model allowed to search the web first.</strong> This
        is closest to what a buyer sees today: whichever pages the model found just now, and whoever those pages put in
        front of it. It moves as fast as the pages do.
      </>
    ),
    empty: 'Named no companies. The model searched and still did not put a list together for this question.',
  },
  single: {
    label: 'Answered',
    note: (
      <>
        <strong className="font-bold">What this model replied when asked your question.</strong> The companies are in
        the order it gave them, which is the part that matters: being named first and being named eighth are different
        results.
      </>
    ),
    empty: 'Named no companies — the model said it did not know any for this question.',
  },
};

/** Both readings of one question by one model. `undefined` = never asked. */
interface Pair {
  memory?: Answer;
  web?: Answer;
}

export default function AnswerLists({ phase1, grounded }: { phase1: ScanPhase1; grounded?: ScanPhase1 }) {
  const providers = phase1.providers.filter((p) => !p.error);
  const twoWay = !!grounded && grounded.totalAnswers > 0;

  /* Keyed on the question index the backend stamped on each answer rather than
     on array position — a failed call leaves no row, and reading positionally
     would print one model's answer to question 3 under question 2. The audit
     trail learned this the hard way; it is the same trap. */
  const readingFor = (provider: string, q: number): Pair => ({
    memory: phase1.providers.find((p) => p.provider === provider)?.answers.find((a) => a.q === q),
    web: grounded?.providers.find((p) => p.provider === provider && !p.error)?.answers.find((a) => a.q === q),
  });

  return (
    <ol className="flex flex-col gap-4">
      {phase1.questions.map((question, q) => {
        /* Both readings count towards "how many named you", because both were
           put to the models and both are printed below. */
        const all = providers.flatMap((p) => {
          const { memory, web } = readingFor(p.provider, q);
          return [memory, web].filter(Boolean) as Answer[];
        });
        const named = all.filter((a) => a.mentioned).length;

        return (
          <li key={`${q}-${question}`} className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
              <span className="flex min-w-0 items-baseline gap-2.5">
                <span className="font-mono text-[10px] font-bold tabular-nums text-gray-300">
                  {String(q + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-[13px] font-semibold leading-snug text-gray-900">{question}</span>
              </span>
              <Verdict tone={named > 0 ? 'on' : 'off'}>
                {named > 0 ? `named you in ${named} of ${all.length}` : `not named in ${all.length}`}
              </Verdict>
            </div>

            {/* One cell per model. `gap-px` over a grey ground draws the
                dividers, so three columns cost three hairlines rather than
                three bordered boxes inside a bordered box. */}
            <div className="grid gap-px bg-gray-100 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((p) => {
                const { memory, web } = readingFor(p.provider, q);
                return (
                  <div key={p.provider} className="flex flex-col gap-4 bg-white p-4">
                    <span className="flex items-center gap-2.5">
                      <ProviderMark provider={p.provider} />
                      <Micro className="text-gray-700">{PROVIDER_LABEL[p.provider]}</Micro>
                    </span>

                    <Reading mode={twoWay ? 'memory' : 'single'} answer={memory} />
                    {twoWay && <Reading mode="web" answer={web} />}
                  </div>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One model's answer to one question: the companies it named, in its order.
 *
 * The rank is the point. "Recommended instead of you" tells a client which
 * names occupy the category; only the ordered list tells them whether a rival
 * is the first thing out of the model's mouth or an afterthought in eighth
 * place, and those are different problems.
 */
function Reading({ mode, answer }: { mode: Mode; answer?: Answer }) {
  const { label, note, empty } = READINGS[mode];

  return (
    <div>
      <NotedLabel label={label} note={note} />

      {/* Three states, and they must not look alike on a report whose whole
          claim is that it does not guess: not asked, asked and answered with
          nobody, asked and answered with a list. */}
      {!answer ? (
        <p className="mt-2 text-[12px] font-medium text-gray-300">Not asked</p>
      ) : answer.names.length === 0 ? (
        <p className="mt-2 text-[12px] font-medium leading-relaxed text-gray-400">{empty}</p>
      ) : (
        /* Wrapping inline rather than one name per line. Eight names × two
           readings × three models × three questions is seventy-two stacked
           rows, and a report already criticised for its length does not get to
           spend a whole screen on each question. Flowing them keeps the rank
           order — which is the entire content — in about a third of the
           height. */
        <ol className="mt-2 flex flex-wrap items-center gap-1">
          {answer.names.map((name, i) => {
            /* Read off `position` rather than matched here. The backend already
               decided what counts as the brand — it resolves the domain root
               too, so "kaivastudio.com" counts as "kaiva studio" — and a second
               opinion computed in the browser would eventually disagree with
               the percentage printed above it. */
            const mine = answer.position === i + 1;
            return (
              <li
                key={`${i}-${name}`}
                className={`inline-flex items-baseline gap-1.5 rounded-md px-1.5 py-1 ${
                  mine ? 'bg-[#39471D]' : 'bg-gray-50'
                }`}
              >
                <span
                  className={`font-mono text-[10px] font-bold tabular-nums ${mine ? 'text-white/60' : 'text-gray-300'}`}
                >
                  {i + 1}
                </span>
                <span className={`text-[12px] font-medium leading-snug ${mine ? 'font-bold text-white' : 'text-gray-700'}`}>
                  {name}
                  {mine && <span className="ml-1 font-medium text-white/70">← you</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
