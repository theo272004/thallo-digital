'use client';

import React, { useState } from 'react';
import { Micro, ProviderMark, Verdict } from './ui';
import { PROVIDER_LABEL, type Answer, type ScanPhase1 } from '@/lib/scan/types';

/**
 * The exact questions we sent, and what came back from each model.
 *
 * This is the part that makes the number above it worth anything. A visibility
 * score with no visible method is a number someone made up, and a buyer is
 * right to treat it that way — so every question, every model and every hit is
 * printed here, collapsed by default so it does not swamp the result.
 *
 * Both readings, in two columns per model. The table showed the memory answers
 * alone and never said so, which is the worst version of this: a reader
 * checking a 50% headline against a grid of dashes concludes the headline is
 * invented. `Mem` and `Web` are narrow enough to keep three models on a laptop
 * screen, and the pair is the argument — the same question, answered two ways.
 */
export default function AuditTrail({ phase1, grounded }: { phase1: ScanPhase1; grounded?: ScanPhase1 }) {
  const [open, setOpen] = useState(false);
  const answered = phase1.providers.filter((p) => !p.error);

  /* Only when it actually ran and produced something. A second column of blanks
     would read as a model that said nothing rather than as a reading that was
     never taken. */
  const twoWay = !!grounded && grounded.totalAnswers > 0;
  const groundedFor = (provider: string) =>
    grounded?.providers.find((g) => g.provider === provider && !g.error);

  /* Keyed on the question index the backend stamped on each answer, not on its
     position in the array. `answers` holds only the questions that came back —
     a call that failed leaves no row — so reading it positionally shifted every
     answer after a failure up by one, and the table then reported model A's
     verdict on question 4 against question 3. Silently, and only on the runs
     where something went wrong: exactly the runs somebody would be checking. */
  const byQuestion = answered.map((p) => new Map(p.answers.map((a) => [a.q, a])));
  const byQuestionWeb = answered.map((p) => new Map((groundedFor(p.provider)?.answers ?? []).map((a) => [a.q, a])));

  return (
    <div className="rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
      >
        <span>
          <Micro className="block text-gray-900">See the exact questions we asked</Micro>
          <span className="mt-1.5 block text-[11px] font-medium text-gray-500">
            {phase1.questions.length} questions · {answered.length} models ·{' '}
            {twoWay
              ? `${phase1.totalAnswers + grounded!.totalAnswers} answers, from memory and searching`
              : `${phase1.totalAnswers} answers`}
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
                  {/* The id we asked for, and — on the rare occasion they differ
                      — the one that answered. Printing only the first would be
                      claiming a method we did not run. */}
                  <span className="block font-mono text-[10px] text-gray-400">{p.model}</span>
                  {p.modelUsed && (
                    <span className="block font-mono text-[10px] text-amber-700">answered by {p.modelUsed}</span>
                  )}
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
                    <th
                      key={p.provider}
                      colSpan={twoWay ? 2 : 1}
                      className="border-l border-gray-100 px-3 py-2.5 text-center"
                    >
                      <Micro className="text-gray-400">{PROVIDER_LABEL[p.provider]}</Micro>
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <th />
                  {twoWay &&
                    answered.map((p) => (
                      <React.Fragment key={p.provider}>
                        <th className="w-[74px] border-l border-gray-100 px-2 py-1.5 text-center">
                          <Micro className="text-gray-300">Mem</Micro>
                        </th>
                        <th className="w-[74px] px-2 py-1.5 text-center">
                          <Micro className="text-gray-300">Web</Micro>
                        </th>
                      </React.Fragment>
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
                    {answered.map((p, col) => {
                      /* No row means this one question was never answered by
                         this model. Blank, not a dash: a dash is the mark for
                         "asked and not named", and the two must not look the
                         same on a page whose whole claim is that it does not
                         guess. */
                      const cell = (a: Answer | undefined, key: string, first: boolean) => (
                        <td
                          key={key}
                          className={`px-2 py-3 text-center align-top ${first ? 'border-l border-gray-100' : ''}`}
                        >
                          {a ? (
                            a.mentioned ? (
                              <Verdict tone="on">{a.position ? `#${a.position}` : 'Named'}</Verdict>
                            ) : (
                              <Verdict tone="off">—</Verdict>
                            )
                          ) : null}
                        </td>
                      );

                      if (!twoWay) return cell(byQuestion[col].get(i), p.provider, true);

                      return (
                        <React.Fragment key={p.provider}>
                          {cell(byQuestion[col].get(i), p.provider + '-mem', true)}
                          {cell(byQuestionWeb[col].get(i), p.provider + '-web', false)}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-gray-100 px-4 py-3">
            <Micro className="text-gray-400">
              {twoWay ? 'Mem = answered from memory · Web = answered with the web open · ' : ''}A number is the rank
              your brand held in that answer · — means it was not named · blank means that model was not asked
            </Micro>
          </p>
        </div>
      )}
    </div>
  );
}
