'use client';
import React, { useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import SpinFlower from '@/components/ui/SpinFlower';
import { SplitReveal, useRevealBatch } from '@/components/motion';
import AuditCTA from '@/components/AuditCTA';
import { CASES, CASE_INDUSTRIES, type CaseStudy } from '@/lib/cases';
import { BASE } from '@/lib/site';

/**
 * The index for /results/ — hero, introduction, the list with its industry
 * filter, and the closing CTA. Each published case has its own page under
 * /results/[slug]/; this page only ever links to those, never to a placeholder.
 */

/* One shared card shell. Live cases are the whole anchor, so the entire card is
   the target; upcoming ones are a plain div — nothing to click, and nothing that
   looks clickable. The two share this content so the list reads as one system. */
function CaseCard({ c }: { c: CaseStudy }) {
  const live = c.status === 'live';

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#39471D] bg-[#39471D]/10 px-2.5 py-1 rounded-full">
          {c.industry}
        </span>
        {/* The status is stated on the card itself, not implied by the styling
            alone — a muted card is easy to miss, a pill is not. */}
        {!live && (
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
        )}
      </div>

      <h3
        className={`mt-5 text-2xl font-bold tracking-tight leading-[1.1] font-sans ${
          live ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {c.headline}
      </h3>

      {/* The figure is the object on a live card. On an upcoming one there is no
          figure, so this line stays small and grey: set at 1.6rem in olive it
          would read as a result whatever the words said. */}
      {live ? (
        <>
          <p className="mt-3 text-[2.1rem] font-bold leading-none tracking-tight text-[#39471D] font-sans tabular-nums">
            {c.metric}
          </p>
          {c.metricLabel && (
            <p className="mt-2 text-sm font-semibold leading-snug text-[#39471D]">{c.metricLabel}</p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm font-medium text-gray-400">{c.metric}</p>
      )}

      <p
        className={`mt-4 text-sm font-medium leading-relaxed ${live ? 'text-gray-500' : 'text-gray-400'}`}
      >
        {c.blurb}
      </p>

      <div className="mt-auto pt-6 flex items-center justify-between gap-4">
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400">
          {c.timeframe}
        </span>
        {live ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#39471D] text-white rounded-full text-sm font-semibold group-hover:bg-[#55672E] transition-colors">
            View case <ArrowUpRight className="text-[11px]" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-400 rounded-full text-sm font-semibold">
            In preparation
          </span>
        )}
      </div>
    </>
  );

  if (!live) {
    return (
      <div
        aria-disabled="true"
        /* Same edge and shadow as a published case — the muted ground and the
           "coming soon" pill carry the difference, not a flatter card. */
        className="flex h-full min-h-[300px] flex-col border border-gray-200 rounded-3xl p-8 bg-gray-50/60 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]"
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={`${BASE}/results/${c.slug}/`}
      className="group flex h-full min-h-[300px] flex-col border border-gray-200 rounded-3xl p-8 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] hover:shadow-[0_16px_40px_-14px_rgba(23,26,16,0.22)] transition-shadow duration-300"
    >
      {body}
    </a>
  );
}

export default function CaseStudiesLanding() {
  /** null = every case. The filter starts open rather than on a sector. */
  const [industry, setIndustry] = useState<string | null>(null);

  // The page owns no other reveal batch — run it here so [data-reveal] animates.
  // Only blocks that are always mounted carry the attribute; the filtered cards
  // deliberately do not, so a card can never arrive from a filter click and find
  // itself pre-hidden by a batch that has already fired.
  useRevealBatch('cases');

  const shown = industry ? CASES.filter((c) => c.industry === industry) : CASES;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-4 font-sans max-w-[16ch]">
            {/* Emphasis by colour, as everywhere else on the site. */}
            Companies that became <span className="text-[#39471D]">the answer.</span>
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Hard categories, verified results. Filter by sector to see the work.
          </p>
          <SpinFlower alt="Thallo" className="block w-20 h-20 opacity-80" />
        </div>
      </section>

      {/* ── Introduction ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F8F9] pt-12 pb-16 2xl:pt-16 2xl:pb-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <SplitReveal
                as="h2"
                className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-4 font-sans"
                html="Every figure has a source."
              />
            </div>
            <div data-reveal>
              <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-5">
                The numbers on these pages come from platform exports — Search Console, analytics,
                the client&rsquo;s own dashboards — over a period we name, with anything projected
                labelled as a projection. Where a category makes identity sensitive, the client&rsquo;s
                name is withheld. The data is not.
              </p>
              <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
                What we look for in an engagement worth writing up is a curve rather than a spike,
                and growth spread across a site rather than carried by one fortunate page. That is
                the difference between authority that compounds and a ranking that happened to land
                — and it is the difference that decides what the work is worth a year later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The list, with its filter ────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Centred: with three cards the list reads as a set rather than the
              start of a longer column, and a left-aligned header over it left
              the row looking as though a fourth were missing. */}
          <div className="max-w-2xl mx-auto mb-10 text-center" data-reveal>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-4 font-sans">
              The cases, by industry.
            </h2>
            {/* The filter instruction moved up to the hero, so this line keeps
                only the part the hero does not say: why the list is short. */}
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mx-auto">
              Published work sits alongside what is still being written up. A case goes up once the
              data covers a full period and the client has cleared every figure in it.
            </p>
          </div>

          {/* The filter sits above the list it governs — pills rather than a
              select, so every option is visible at a glance and the count of
              sectors stays honest about how much work is published. */}
          <div
            role="group"
            aria-label="Filter case studies by industry"
            className="mb-10 flex flex-wrap justify-center gap-2.5"
          >
            {[null, ...CASE_INDUSTRIES].map((option) => {
              const active = industry === option;
              return (
                <button
                  key={option ?? 'all'}
                  type="button"
                  onClick={() => setIndustry(option)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#39471D] border-[#39471D] text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-[#55672E]/40 hover:text-[#39471D]'
                  }`}
                >
                  {option ?? 'All cases'}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((c) => (
              <CaseCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {/* Scrim because this photograph carries lit wood on the side the copy
          sits on, and white type has to clear AA over it. */}
      <AuditCTA
        image={`${BASE}/results-bg.webp`}
        scrim
        heading="Start with the evidence."
        copy="An AI visibility audit shows how your category looks today, where the authority sits, and what it takes to move. Fixed scope, and a roadmap you keep either way."
      />
    </>
  );
}
