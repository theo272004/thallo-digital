'use client';
import React, { useRef } from 'react';
import SpinFlower from '@/components/ui/SpinFlower';
import AuditCTA from '@/components/AuditCTA';
import { SplitReveal } from '@/components/motion';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * A real engagement, anonymised. Every figure traces back to a Search Console
 * export, January–July 2026 — which is why the projected row stays labelled and
 * the provenance is printed rather than implied.
 */
const HEADLINE = [
  /* Reads "+230%" rather than "3.3x" — see the note on the same figure in
     `src/lib/cases.ts`. The two have to agree. */
  { fig: '+230%', lbl: 'Monthly organic clicks', copy: 'Against the same month before the engagement began.' },
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

/** Reads the count-up settings a figure carries and formats a value with them. */
function formatFrom(el: HTMLElement, v: number) {
  const decimals = Number(el.dataset.decimals || 0);
  return (
    (el.dataset.prefix || '') +
    v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

export default function ResultsLanding() {
  const tableRef = useRef<HTMLDivElement>(null);

  /**
   * The table fills itself in the first time it is scrolled to: rows rise in,
   * the click bars grow from nothing, and every figure counts up from zero.
   * Once only — it plays as you arrive at the section, not every time you pass.
   *
   * The markup always ships the finished numbers, so a crawler, a reader with
   * JavaScript off and anyone who asked their system for less motion all get
   * the real figures. The rewind to zero happens on enter, in the same frame
   * the tween starts, so the final value is never seen snapping back.
   */
  useGSAP(
    () => {
      const root = tableRef.current;
      if (!root || prefersReducedMotion()) return;

      const rows = gsap.utils.toArray<HTMLElement>('tbody tr', root);
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', root);
      const figures = gsap.utils.toArray<HTMLElement>('[data-to]', root);
      const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]', root);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 82%',
          once: true,
          onEnter: () => figures.forEach((el) => { el.textContent = formatFrom(el, 0); }),
        },
      });

      tl.from(rows, { autoAlpha: 0, y: 12, duration: 0.5, ease: 'power2.out', stagger: 0.07 }, 0)
        .from(bars, { scaleX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }, 0.08);

      figures.forEach((el, i) => {
        const to = Number(el.dataset.to);
        const decimals = Number(el.dataset.decimals || 0);
        const obj = { v: 0 };
        tl.to(
          obj,
          {
            v: to,
            duration: 1.1,
            ease: 'power2.out',
            snap: { v: decimals ? 1 / 10 ** decimals : 1 },
            onUpdate: () => { el.textContent = formatFrom(el, obj.v); },
          },
          // three figures per row, so they run with the row that owns them
          0.08 + Math.floor(i / 3) * 0.07
        );
      });

      // The totals land on the table once the months have finished arriving.
      // They settle rather than count: one of the three is 41→13, which is a
      // journey and not a quantity, and three tiles animating three different
      // ways would read as noise.
      tl.from(
        tiles,
        { autoAlpha: 0, y: 16, scale: 0.96, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
        0.62
      );
    },
    { scope: tableRef }
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          {/* This page used to BE /results/; it now sits under it, so it needs a
              way back up to the index that lists it. */}
          <a
            href={`${BASE}/results/`}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition-colors hover:text-[#39471D]"
          >
            <span aria-hidden="true">&larr;</span> All case studies
          </a>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            {/* Emphasis by colour, not by swapping typeface mid-sentence. */}
            From page two to page one,<br />in <span className="text-[#39471D]">six months.</span>
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[56ch] mb-10">
            A veteran-founded service in the VA disability claims space — a compliance-heavy
            category where every statement has to be accurate, the incumbents are large, and the
            audience is sceptical by default. Authority was the only way in.
          </p>
          <SpinFlower alt="Thallo" className="block w-20 h-20 opacity-80" />
        </div>
      </section>

      {/* ── Headline figures, on the photo panel ─────────────────────────── */}
      <section className="bg-[#F7F8F9] pt-12 pb-16 2xl:pt-16 2xl:pb-20 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-[28px] px-10 py-12 sm:px-16 sm:py-14"
            style={{
              backgroundImage: `url(${BASE}/measured-bg.webp)`,
              backgroundSize: 'cover',
              // As high as the crop allows without enlarging the picture. The
              // photograph is 2.48:1 against a 2.63:1 panel, so `cover` leaves
              // only ~29px of vertical slack; this pins its bottom edge to the
              // panel's, which is the full 14px of travel there is.
              backgroundPosition: 'center 100%',
            }}
          >
            {/* A scrim only where the type sits. The photograph averages dark,
                but its highlights — the lit flower on the wall — reach a point
                where white on them falls to 3.7:1. This holds the left side down
                so the heading clears AA whatever photograph goes in here next. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#171A10]/55 via-[#171A10]/20 to-transparent"
            />

            <div className="relative max-w-lg mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05] font-sans">
                Six months, measured.
              </h2>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="bg-white py-16 2xl:py-20 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4 font-sans leading-[1.05]"
              html="The six-month trajectory."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
              Every full month beat the one before it on clicks. A curve, not a spike — which is
              what tells you the gains are structural.
            </p>
          </div>

          {/* One panel, hairline rules between the months. No pills: the figure
              is the object, so it carries the weight and the label sits once at
              the top of its column, in Inter — the mono heading row was the
              part that did not belong. Numbers are right-aligned on tabular
              figures, so the digits line up column by column and the eye can
              run down them. */}
          {/* The panel and its totals animate as one arrival, so they share a
              scope and a single ScrollTrigger. */}
          <div ref={tableRef}>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]">
            {/* Wide content scrolls inside its own panel, never the page.
                overflow-y-hidden is not redundant: setting one axis to `auto`
                computes the other from `visible` to `auto` too, so the 12px the
                rows travel during the entrance raised a vertical scrollbar. */}
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">
                  Monthly organic clicks, impressions and average position, February to July 2026
                </caption>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th scope="col" className="px-7 py-4 text-[13px] font-semibold text-gray-500">Month</th>
                    <th scope="col" className="px-7 py-4 text-right text-[13px] font-semibold text-gray-500">Organic clicks</th>
                    <th scope="col" className="px-7 py-4 text-right text-[13px] font-semibold text-gray-500">Impressions</th>
                    <th scope="col" className="px-7 py-4 text-right text-[13px] font-semibold text-gray-500">Avg. position</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((r) => {
                    // Impressions ship as display strings; the counter needs the
                    // number and the leading ~ kept apart.
                    const imprTo = Number(r.impr.replace(/[^0-9]/g, ''));
                    const imprPrefix = r.impr.trim().startsWith('~') ? '~' : '';
                    return (
                    /* The projected month carries a wash of olive and its label,
                       nothing louder — it is still one of the rows. */
                    <tr
                      key={r.m}
                      className={`border-b border-gray-50 transition-colors last:border-0 ${
                        r.projected ? 'bg-[#39471D]/[0.03]' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <th scope="row" className="whitespace-nowrap px-7 py-5 align-middle">
                        <span className="text-base font-bold text-gray-900">{r.m}</span>
                        {r.projected && (
                          <span className="ml-2 text-xs font-medium text-[#55672E]">Projected</span>
                        )}
                      </th>
                      <td className="px-7 py-5 text-right align-middle">
                        <span
                          className="text-[15px] font-bold text-[#39471D] tabular-nums"
                          data-to={r.clicks}
                          data-prefix={r.projected ? '~' : ''}
                        >
                          {r.projected ? '~' : ''}{r.clicks.toLocaleString('en-US')}
                        </span>
                        {/* Carries the shape of the curve without a chart library */}
                        <span
                          aria-hidden="true"
                          className="mt-2 ml-auto block h-[3px] w-full max-w-[120px] overflow-hidden rounded-full bg-gray-100"
                        >
                          <span
                            data-bar
                            className="block h-full origin-left rounded-full bg-[#39471D]"
                            style={{ width: `${(r.clicks / PEAK) * 100}%` }}
                          />
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-7 py-5 text-right align-middle text-base font-medium text-gray-500 tabular-nums">
                        <span data-to={imprTo} data-prefix={imprPrefix}>{r.impr}</span>
                      </td>
                      <td className="px-7 py-5 text-right align-middle text-base font-semibold text-gray-900 tabular-nums">
                        <span data-to={r.pos} data-decimals="1">{r.pos}</span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Three small tiles, lifted so they sit ON the table's bottom edge
              rather than below it. The overlap is 16px against 20px of cell
              padding on the last row, so they cover the panel's own margin and
              never reach a figure. A deeper shadow than the panel's sells the
              lift; z-10 keeps them on top whatever the paint order. */}
          <div className="relative z-10 -mt-4 flex flex-wrap gap-3 md:justify-end">
            {CALLOUTS.map((c) => (
              /* Same bubble as the floating card on the home dashboard, down to
                 the sans figure and the tracked-out grey label — these used to
                 be a serif figure over near-black at a heavier shadow, which
                 read as a different object doing the same job. */
              <div
                key={c.lbl}
                data-tile
                className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] md:flex-none"
              >
                <span className="whitespace-nowrap text-[22px] font-bold leading-none text-[#39471D] tabular-nums">
                  {c.fig}{c.suffix}
                </span>
                <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400">
                  {c.lbl}
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── The compounding effect ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F7F8F9] py-16 2xl:py-20 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4 font-sans leading-[1.05]"
              html="The compounding effect."
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
            {/* Prose — no box around it any more; the sheet is the object here */}
            <div data-reveal>
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

            {/* The reference's materials on a card that sits straight: light
                surface, hairline border, soft shadow, the mark in the corner
                over a name and a label. */}
            <div data-reveal>
              <div className="relative">
                <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-white p-7 sm:p-9 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]">
                  {/* The mark, the way the reference carries its own */}
                  <div className="mb-8 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#39471D]">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={`${BASE}/isotipo.png`}
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-6 object-contain select-none"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-gray-900">Thallo</span>
                      <span className="block text-xs font-medium text-gray-400">Case study</span>
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-medium leading-relaxed text-gray-900">
                    The two clusters we invested in most heavily were also the two that grew the most —
                    270% and 242%. When results track investment that precisely, you know it is the
                    strategy working, not luck.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Provenance — the figures are real, so say where they come from. */}
          <p className="mt-8 text-xs leading-relaxed text-gray-400 max-w-[80ch]">
            Source: Google Search Console, January–July 2026. Client identity withheld for
            confidentiality. Figures reflect one engagement over a defined period and are not a
            guarantee of future results — outcomes vary by market, competition and site.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {/* The photograph is this page's own — cta-bg is still the home's closing
          shot — and its left edge carries lit wood, hence the scrim. */}
      <AuditCTA
        image={`${BASE}/results-bg.webp`}
        scrim
        heading="See where you stand today."
        copy="Start with an AI visibility audit. Fixed scope, and a roadmap you keep either way."
      />
    </>
  );
}
