'use client';

import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

/**
 * A real engagement, anonymised — Search Console figures, January–July 2026.
 * Every number here traces back to that export; nothing is illustrative. The
 * projected row stays labelled as projected for exactly that reason.
 */
const HEADLINE = [
  { fig: '3.3x',        lbl: 'Monthly organic clicks' },
  { fig: '+489%',       lbl: 'Impressions, Feb–Jun' },
  { fig: '10.8 → 7.6',  lbl: 'Average position' },
  { fig: '~10x',        lbl: 'Search visibility' },
];

const MONTHS = [
  { m: 'February', clicks: 12941, impr: '103,964', pos: '10.1' },
  { m: 'March',    clicks: 13586, impr: '234,712', pos: '9.5'  },
  { m: 'April',    clicks: 14566, impr: '301,977', pos: '9.7'  },
  { m: 'May',      clicks: 16160, impr: '372,241', pos: '9.8'  },
  { m: 'June',     clicks: 19938, impr: '612,076', pos: '8.0'  },
  { m: 'July',     clicks: 22500, impr: '~615,000', pos: '7.6', projected: true },
];

const PEAK = Math.max(...MONTHS.map((r) => r.clicks));

const CALLOUTS = [
  { fig: '+54%',    lbl: 'Monthly clicks, February to June' },
  { fig: '41 → 13', lbl: 'Flagship pillar page position' },
  { fig: '+270%',   lbl: 'Growth in the top content cluster' },
];

export default function ResultsDashboard() {
  return (
    <section className="bg-gray-50/50 py-24 sm:py-28 border-b border-gray-100" id="results">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="max-w-[54ch] mb-16">
          <Eyebrow className="mb-5">Case study</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
            html='From page two to page one, in <span class="font-serif italic text-[#39471D]">six months.</span>'
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed">
            A veteran-founded service in the VA disability claims space — a compliance-heavy
            category where every statement has to be accurate, the incumbents are large, and
            the audience is sceptical by default. Authority was the only way in.
          </p>
        </div>

        {/* ── Headline figures ────────────────────────────────────────────── */}
        <div data-reveal className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200/70 border border-gray-200/70 rounded-3xl overflow-hidden mb-20">
          {HEADLINE.map((s) => (
            <div key={s.lbl} className="bg-white px-7 py-9">
              {/* nowrap so "10.8 → 7.6" stays on one line and every label in
                  the band sits on the same baseline */}
              <p className="text-3xl font-bold text-[#39471D] tracking-tight leading-none tabular-nums whitespace-nowrap">
                {s.fig}
              </p>
              <p className="mt-3 text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400">
                {s.lbl}
              </p>
            </div>
          ))}
        </div>

        {/* ── The six-month trajectory ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-10 lg:gap-16 items-start mb-20">
          <div className="lg:pt-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
              The six-month trajectory
            </h3>
            <p className="text-gray-500 font-medium text-base leading-relaxed">
              Every full month beat the one before it on clicks. A curve, not a spike — which is
              what tells you the gains are structural.
            </p>
          </div>

          {/* Wide content scrolls inside its own container, never the page */}
          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">
                Monthly organic clicks, impressions and average position, February to July 2026
              </caption>
              <thead>
                <tr className="border-b border-gray-100">
                  {['Month', 'Organic clicks', 'Impressions', 'Avg. position'].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-6 py-4 font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-gray-400 ${i > 0 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((r) => (
                  <tr
                    key={r.m}
                    className={`border-b border-gray-50 last:border-0 ${r.projected ? 'bg-[#39471D]/[0.04]' : ''}`}
                  >
                    <th scope="row" className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {r.m}
                      {r.projected && (
                        <span className="ml-2 font-mono text-[9px] font-bold tracking-[0.12em] uppercase text-[#55672E] align-middle">
                          Projected
                        </span>
                      )}
                    </th>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        {r.projected ? '~' : ''}{r.clicks.toLocaleString('en-US')}
                      </span>
                      {/* Bar carries the shape of the curve without a chart library */}
                      <span aria-hidden="true" className="mt-1.5 block h-[3px] rounded-full bg-gray-100 overflow-hidden">
                        <span
                          className="block h-full rounded-full bg-[#39471D]"
                          style={{ width: `${(r.clicks / PEAK) * 100}%` }}
                        />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-500 tabular-nums whitespace-nowrap">
                      {r.impr}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#39471D] tabular-nums">
                      {r.pos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Callout figures ─────────────────────────────────────────────── */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {CALLOUTS.map((c) => (
            <div key={c.lbl} className="rounded-3xl p-8 bg-[#39471D]">
              <p className="text-3xl font-bold text-[#CBD0AC] tracking-tight leading-none tabular-nums whitespace-nowrap">
                {c.fig}
              </p>
              <p className="mt-3 text-[11px] font-bold tracking-[0.14em] uppercase text-white/50">
                {c.lbl}
              </p>
            </div>
          ))}
        </div>

        {/* ── The compounding effect ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-10 lg:gap-16 items-start">
          <div className="lg:pt-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              The compounding effect
            </h3>
          </div>

          <div data-reveal className="max-w-[64ch]">
            <p className="text-gray-500 font-medium text-base leading-relaxed mb-5">
              The work was built to compound. Early cluster work matured into rankings months
              later, while fresh content and refreshes kept adding momentum on top of it. By June
              the site was being shown for roughly{' '}
              <strong className="text-gray-900 font-bold">ten times more searches</strong> than in
              January, and average position had climbed from page two to page one.
            </p>
            <p className="text-gray-500 font-medium text-base leading-relaxed">
              What matters most is that the growth was{' '}
              <strong className="text-gray-900 font-bold">spread across the whole site</strong>,
              not carried by one lucky page. Every hub grew by double or triple digits — the
              signature of authority that holds, rather than a ranking that happened to land.
            </p>

            <blockquote className="mt-10 border-l-2 border-[#39471D] pl-7">
              <p className="font-serif italic text-xl sm:text-2xl text-gray-900 leading-snug">
                The two clusters we invested in most heavily were also the two that grew the most —
                270% and 242%. When results track investment that precisely, you know it is the
                strategy working, not luck.
              </p>
            </blockquote>

            {/* Provenance — the figures are real, so say where they come from
                and what they do and do not promise. */}
            <p className="mt-10 pt-6 border-t border-gray-200/70 font-mono text-[10px] leading-relaxed tracking-[0.08em] uppercase text-gray-400">
              Source: Google Search Console, January–July 2026. Client identity withheld for
              confidentiality. Figures reflect one engagement over a defined period and are not a
              guarantee of future results — outcomes vary by market, competition and site.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
