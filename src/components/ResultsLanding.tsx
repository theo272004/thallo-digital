'use client';
import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

/**
 * A real engagement, anonymised. Every figure traces back to a Search Console
 * export, January–July 2026 — which is why the projected row stays labelled and
 * the provenance is printed rather than implied.
 */
const HEADLINE = [
  { fig: '3.3x',  lbl: 'Monthly organic clicks', copy: 'Against the same month before the engagement began.' },
  { fig: '+489%', lbl: 'Impressions',            copy: 'February to June, as the clusters matured into rankings.' },
  // The arrival figure leads; the starting point rides in the copy. "10.8 → 7.6"
  // set at 2.6rem simply does not fit a quarter-width card.
  { fig: '7.6',   lbl: 'Average position',       copy: 'Up from 10.8 — the move from page two onto page one.' },
  { fig: '~10x',  lbl: 'Search visibility',      copy: 'Searches the site was shown for, June against January.' },
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
  { fig: '+54',   suffix: '%', lbl: 'Monthly clicks', copy: 'Growth from February to June, with every full month beating the one before it.' },
  { fig: '41→13', suffix: '',  lbl: 'Flagship pillar', copy: 'The position of the single most important page on the site.' },
  { fig: '+270',  suffix: '%', lbl: 'Top cluster',     copy: 'Growth in the content hub that received the deepest investment.' },
];

/* The dark cards floating on the photo panel — the site's signature move. */
const glassCard = {
  background: 'rgba(20,20,18,0.72)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
} as const;

export default function ResultsLanding() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-44 pb-16 2xl:pt-56 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <Eyebrow center className="mb-5">Case study</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            From page two to page one,<br />in <span className="font-serif italic text-[#39471D]">six months.</span>
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[56ch] mb-10">
            A veteran-founded service in the VA disability claims space — a compliance-heavy
            category where every statement has to be accurate, the incumbents are large, and the
            audience is sceptical by default. Authority was the only way in.
          </p>
          <img loading="lazy" decoding="async"
            src="/thallo-digital/flower.webp"
            alt="Thallo"
            className="w-20 h-20 object-contain opacity-80 thallo-spin"
          />
        </div>
      </section>

      {/* ── Headline figures, on the photo panel ─────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-[28px] px-10 py-14 sm:px-16 sm:py-20"
            style={{
              backgroundImage: 'url(/thallo-digital/buyers-bg.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-lg mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05] font-sans">
                Six months, measured.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HEADLINE.map((s) => (
                <div
                  key={s.lbl}
                  className="rounded-3xl p-[30px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                  style={glassCard}
                >
                  <p
                    className="font-bold text-[2.6rem] leading-none font-sans tracking-tight mb-4 whitespace-nowrap"
                    style={{ color: '#F3E6C1' }}
                  >
                    {s.fig}
                  </p>
                  <h3 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>{s.lbl}</h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
                    {s.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The six-month trajectory ─────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <Eyebrow className="mb-5">Trajectory</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
              html="The six-month trajectory."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
              Every full month beat the one before it on clicks. A curve, not a spike — which is
              what tells you the gains are structural.
            </p>
          </div>

          {/* Wide content scrolls inside its own card, never the page */}
          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <caption className="sr-only">
                Monthly organic clicks, impressions and average position, February to July 2026
              </caption>
              <thead>
                <tr className="border-b border-gray-100">
                  {['Month', 'Organic clicks', 'Impressions', 'Avg. position'].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-7 py-5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-gray-400 ${i > 0 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((r) => (
                  <tr key={r.m} className={`border-b border-gray-50 last:border-0 ${r.projected ? 'bg-[#39471D]/[0.04]' : ''}`}>
                    <th scope="row" className="px-7 py-5 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {r.m}
                      {r.projected && (
                        <span className="ml-2 font-mono text-[9px] font-bold tracking-[0.12em] uppercase text-[#55672E] align-middle">
                          Projected
                        </span>
                      )}
                    </th>
                    <td className="px-7 py-5 text-right">
                      <span className="text-base font-serif font-bold text-[#39471D] tabular-nums">
                        {r.projected ? '~' : ''}{r.clicks.toLocaleString('en-US')}
                      </span>
                      {/* Carries the shape of the curve without a chart library */}
                      <span aria-hidden="true" className="mt-2 block h-[3px] rounded-full bg-gray-100 overflow-hidden">
                        <span className="block h-full rounded-full bg-[#39471D]" style={{ width: `${(r.clicks / PEAK) * 100}%` }} />
                      </span>
                    </td>
                    <td className="px-7 py-5 text-right text-sm font-medium text-gray-500 tabular-nums whitespace-nowrap">
                      {r.impr}
                    </td>
                    <td className="px-7 py-5 text-right text-sm font-bold text-gray-900 tabular-nums">
                      {r.pos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Callouts — the house stat card, serif figures on white ───────── */}
      <section className="bg-gray-50/50 py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CALLOUTS.map((c) => (
              <div key={c.lbl} data-reveal className="p-8 sm:p-10 bg-white border border-gray-100 rounded-3xl flex flex-col">
                <div className="text-5xl lg:text-6xl font-serif text-[#39471D] font-bold mb-3 tabular-nums whitespace-nowrap">
                  {c.fig}{c.suffix}
                </div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-gray-900 mb-2">{c.lbl}</p>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{c.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The compounding effect ───────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <Eyebrow className="mb-5">Why it worked</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
              html="The compounding effect."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Prose */}
            <div data-reveal className="p-8 sm:p-10 bg-white border border-gray-100 rounded-3xl">
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
            </div>

            {/* Quote — olive card with the isotipo watermark, as on Services */}
            <div data-reveal className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-[#39471D] shadow-[0_30px_70px_-30px_rgba(57,71,29,0.6)] flex flex-col justify-center">
              <img loading="lazy" decoding="async"
                src="/thallo-digital/isotipo.png"
                alt=""
                aria-hidden="true"
                className="absolute -top-16 -right-16 w-72 rotate-[18deg] opacity-[0.09] pointer-events-none select-none"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <p className="relative font-serif italic text-2xl sm:text-3xl text-white leading-snug">
                The two clusters we invested in most heavily were also the two that grew the most —
                270% and 242%. When results track investment that precisely, you know it is the
                strategy working, not luck.
              </p>
            </div>
          </div>

          {/* Provenance — the figures are real, so say where they come from. */}
          <p className="mt-12 font-mono text-[10px] leading-relaxed tracking-[0.08em] uppercase text-gray-400 max-w-[80ch]">
            Source: Google Search Console, January–July 2026. Client identity withheld for
            confidentiality. Figures reflect one engagement over a defined period and are not a
            guarantee of future results — outcomes vary by market, competition and site.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-white py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">
            <img loading="lazy" decoding="async"
              src="/thallo-digital/cta-bg.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ zIndex: 0 }}
            />
            <div className="relative z-[2] max-w-xl">
              <Eyebrow tone="light" className="mb-6">Your turn</Eyebrow>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans">
                See where you stand today.
              </h2>
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch] mb-8">
                Start with an AI visibility audit. Fixed scope, and a roadmap you keep either way.
              </p>
              <a
                href="/thallo-digital/contact/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                Book an audit <span className="text-[11px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
