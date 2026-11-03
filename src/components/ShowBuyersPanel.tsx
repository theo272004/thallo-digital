'use client';

import React from 'react';
import { LayoutTemplate, Mic } from 'lucide-react';

/**
 * The right half of Show Buyers: a pale panel with one small white card in
 * it, after the reference Cami sent on 3 November (a feature list on the left,
 * a panel on the right whose card follows the selected item).
 *
 * The card carries no words, because the copy is all in the paragraphs on the
 * left and none may be added. It is drawn in the grammar of a product screen
 * instead: an icon, skeleton lines for text, and one small motion that says
 * what the selected paragraph says.
 *
 *   0 — research: a transcript whose key phrases are highlighted one by one,
 *       and three tags that fill as the insights are captured.
 *   1 — plan: a site map that builds itself (a page, then three under it),
 *       and below it the right people lighting up as the work reaches them.
 *
 * Each card remounts when it becomes the active one (keyed by `active`), so
 * its CSS animations start over every time. Styles are in globals.css under
 * "Show Buyers' panel".
 */

function Bar({ w, hl, delay }: { w: string; hl?: boolean; delay?: number }) {
  return (
    <span
      className={`block h-2 rounded-full bg-gray-200 ${hl ? 'sbp-hl' : ''}`}
      style={{ width: w, animationDelay: delay !== undefined ? `${delay}s` : undefined }}
    />
  );
}

function Header({ Icon }: { Icon: typeof Mic }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39471D]/10 text-[#39471D]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="block h-2.5 w-28 rounded-full bg-gray-300" />
        <span className="block h-2 w-40 rounded-full bg-gray-200" />
      </span>
    </div>
  );
}

function ResearchCard() {
  return (
    <>
      <Header Icon={Mic} />
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex gap-1.5"><Bar w="22%" /><Bar w="34%" hl delay={0.5} /><Bar w="18%" /></div>
        <div className="flex gap-1.5"><Bar w="30%" /><Bar w="16%" /><Bar w="28%" /></div>
        <div className="flex gap-1.5"><Bar w="14%" /><Bar w="26%" /><Bar w="36%" hl delay={1.2} /></div>
        <div className="flex gap-1.5"><Bar w="40%" hl delay={1.9} /><Bar w="22%" /></div>
      </div>
      <div className="mt-6 flex gap-2">
        {[2.6, 2.9, 3.2].map((d) => (
          <span key={d} className="sbp-tag block h-5 w-14 rounded-full border border-gray-200" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </>
  );
}

function PlanCard() {
  return (
    <>
      <Header Icon={LayoutTemplate} />
      <div className="mt-6 flex flex-col items-center">
        <span className="sbp-pop block h-6 w-24 rounded-md border border-[#39471D]/40 bg-[#39471D]/[0.06]" style={{ animationDelay: '0.3s' }} />
        <span className="sbp-pop block h-3 w-px bg-gray-300" style={{ animationDelay: '0.6s' }} />
        <span className="sbp-pop block h-px w-[60%] bg-gray-300" style={{ animationDelay: '0.6s' }} />
        <div className="flex w-[66%] justify-between">
          {[0.9, 1.1, 1.3].map((d) => (
            <span key={d} className="flex flex-col items-center">
              <span className="sbp-pop block h-3 w-px bg-gray-300" style={{ animationDelay: `${d}s` }} />
              <span className="sbp-pop block h-5 w-14 rounded-md border border-gray-200 bg-white" style={{ animationDelay: `${d}s` }} />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2.5">
        {[2.0, 2.2, 2.4, 2.6, 2.8].map((d) => (
          <span key={d} className="sbp-person block h-2.5 w-2.5 rounded-full bg-gray-200" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </>
  );
}

export default function ShowBuyersPanel({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center rounded-[28px] bg-[#ECEEE7] p-8 sm:p-12 lg:min-h-[440px] short:min-h-[360px]">
      <div
        key={active}
        className="sbp-card w-full max-w-[360px] rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]"
      >
        {active === 0 ? <ResearchCard /> : <PlanCard />}
      </div>
    </div>
  );
}
