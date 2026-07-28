'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import EngagementSteps from '@/components/EngagementSteps';
import { Magnetic } from '@/components/motion';

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    idx: '01',
    kicker: 'Entry point',
    tab: 'Audit',
    title: 'AI Visibility Audit',
    desc: 'See exactly where you show up when buyers ask AI, where competitors beat you, and what it takes to lead.',
    deliverables: [
      'Visibility benchmark vs. rivals',
      'Share-of-answer scoring',
      'Technical readiness review',
      'Content & authority gaps',
      'Prioritized 90-day roadmap',
      'Competitor teardown',
    ],
    price: 'One-time · no lock-in',
  },
  {
    idx: '02',
    kicker: 'Core program',
    tab: 'Authority Engine',
    title: 'The Authority Engine',
    desc: 'Our monthly engine that builds, publishes, and compounds authority across search and AI, so you keep winning the research phase.',
    deliverables: [
      'Deeply researched content',
      'Technical AI-readiness build',
      'Search & AI visibility',
      'Distribution to buyer channels',
      'Consistent brand narrative',
      'Monthly outcome reporting',
    ],
    price: 'Ongoing · monthly partnership',
  },
  {
    idx: '03',
    kicker: 'Accelerate',
    tab: 'Flagship',
    title: 'Flagship Projects',
    desc: 'High-value assets that earn citations and put you on the map — as a standalone project or layered onto your engine.',
    deliverables: [
      'Proprietary data studies',
      'Industry reports',
      'Digital PR & podcasts',
      'Interactive tools',
      'Signature research',
      'Launch strategy',
    ],
    price: 'Per project · scoped to you',
  },
];

const COMPARE = [
  { feature: 'AI visibility benchmark',      audit: true,  engine: true,       flagship: false },
  { feature: 'Technical AI-readiness build', audit: false, engine: true,       flagship: false },
  { feature: 'Original, researched content', audit: false, engine: 'Monthly',  flagship: 'Deep' },
  { feature: 'Distribution & publishing',    audit: false, engine: true,       flagship: false },
  { feature: 'Proprietary data studies',     audit: false, engine: false,      flagship: true },
  { feature: 'Digital PR & podcasts',        audit: false, engine: false,      flagship: true },
  { feature: 'Monthly outcome reporting',    audit: false, engine: true,       flagship: false },
  { feature: 'Best for',                     audit: 'Getting clarity', engine: 'Compounding growth', flagship: 'Big moves' },
];

const FAQS = [
  { q: 'What if AI says something wrong about us?',              a: 'It happens, and there is no edit button. No AI company lets you log in and correct it. What you can do is make the accurate version of your story the strongest, most consistent signal across the places AI reads, so the correct answer becomes the one it repeats. Getting that right is a large part of our work, and it is why precision matters to us more than volume.' },
  { q: 'Can you prove it is working?',                           a: 'Yes, with honesty about what is measurable and what is not. We track how often you appear in AI answers for the questions your buyers ask, the sources citing you, and the pipeline your presence influences. What no one can promise is perfect click-by-click attribution; AI search is newer and messier than Google. We report the real signals, not a vanity dashboard, and we are straight about the limits.' },
  { q: 'Will this bring us more customers?',                     a: 'We build the preference, visibility, and pipeline that make you far more likely to win, and keep you on the shortlist. What we will not do is promise a fixed number of sales. In a long, multi-person buying decision, anyone who does is guessing.' },
  { q: 'How fast will we see results?',                          a: 'Faster than old-school SEO. Because AI reads and cites fresh content in real time, early movement — first mentions and first citations — can show up within weeks, not the long months traditional search used to demand. The deeper, compounding authority builds from there.' },
  { q: 'Where do we start, and how much do we have to commit?', a: 'You start small. Almost everyone begins with the audit: fixed scope, no lock-in, and you walk away with a clear picture and a roadmap you keep whether or not you continue. It is the lowest-risk way to see where you stand before committing to anything bigger.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Check({ featured }: { featured: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
      stroke={featured ? '#CBD0AC' : '#55672E'}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="mt-0.5 flex-shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const OLIVE_TEXT = new Set(['Monthly', 'Deep', 'Compounding growth']);

/**
 * Yes is loud, no is quiet. Both marks used to be a pale disc with a pale glyph
 * inside, so the table read as one even texture and you had to stop and look to
 * find what was included. A filled olive disc against a bare dash separates
 * them at a glance — and absence should not draw the eye anyway.
 * The mark alone says nothing aloud, so each carries its word.
 */
function CompareCell({ val }: { val: boolean | string }) {
  if (val === true) return (
    <span className="mx-auto flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#39471D]">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="4 12 9 17 20 7" />
      </svg>
      <span className="sr-only">Included</span>
    </span>
  );
  if (val === false) return (
    <span className="mx-auto flex h-[26px] w-[26px] items-center justify-center">
      <span className="block h-[2px] w-[11px] rounded-full bg-gray-300" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
  return (
    <span className={`text-[13px] font-bold ${OLIVE_TEXT.has(val as string) ? 'text-[#39471D]' : 'text-gray-900'}`}>
      {val}
    </span>
  );
}

function CompareIcon({ feature }: { feature: string }) {
  const p = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none' as const, stroke: '#39471D', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const map: Record<string, React.ReactNode> = {
    'AI visibility benchmark':       <svg {...p}><line x1="18" y1="20" x2="18" y2="9"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="13"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    'Technical AI-readiness build':  <svg {...p}><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="2" y="2" width="20" height="20" rx="3"/></svg>,
    'Original, researched content':  <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'Distribution & publishing':     <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    'Proprietary data studies':      <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    'Digital PR & podcasts':         <svg {...p}><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    'Monthly outcome reporting':     <svg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    'Best for':                      <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  };
  return <>{map[feature] ?? null}</>;
}

// visual order: active card → middle, others fill left/right in their natural sequence
function getOrder(cardIdx: number, active: number): number {
  if (cardIdx === active) return 2;
  const others = [0, 1, 2].filter(i => i !== active);
  return cardIdx === others[0] ? 1 : 3;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [activeService, setActiveService] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedRects = useRef<(DOMRect | null)[]>([]);

  function handleServiceChange(idx: number) {
    if (idx === activeService) return;
    savedRects.current = wrapperRefs.current.map(el =>
      el ? el.getBoundingClientRect() : null
    );
    setActiveService(idx);
  }

  // FLIP: after state update (DOM now reflects new order), animate from old positions
  useLayoutEffect(() => {
    const oldRects = savedRects.current;
    if (!oldRects.length) return;

    wrapperRefs.current.forEach((el, i) => {
      if (!el || !oldRects[i]) return;
      const newRect = el.getBoundingClientRect();
      const dx = oldRects[i]!.left - newRect.left;
      if (Math.abs(dx) < 1) return;

      // Place card at old visual position instantly
      el.style.transition = 'none';
      el.style.transform = `translateX(${dx}px)`;

      // Force layout flush
      void el.offsetWidth;

      // Animate to actual new position
      el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      el.style.transform = '';
    });

    savedRects.current = [];
  }, [activeService]);

  return (
    <>

      {/* ── Hero (centered) ───────────────────────────────────────────────── */}
      <section className="bg-white pt-44 pb-16 2xl:pt-56 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <Eyebrow center className="mb-5">Services</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            One engine to make you<br />the answer.
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Everything we do builds toward one outcome: making you the name buyers and AI trust.
          </p>
          <img loading="lazy" decoding="async"
            src="/thallo-digital/flower.webp"
            alt="Thallo"
            className="w-20 h-20 object-contain opacity-80 thallo-spin"
          />
        </div>
      </section>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-gray-100/80 rounded-full p-1 gap-1">
              {SERVICES.map((svc, i) => (
                <button
                  key={svc.idx}
                  onClick={() => handleServiceChange(i)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeService === i
                      ? 'bg-[#39471D] text-white shadow-[0_2px_8px_rgba(57,71,29,0.35)]'
                      : 'text-gray-500 hover:text-[#39471D]'
                  }`}
                >
                  {svc.tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid — FLIP-animated */}
          <div className="flex gap-6 items-stretch" style={{ minHeight: 0 }}>
            {SERVICES.map((svc, i) => {
              const isFeatured = i === activeService;
              return (
                <div
                  key={svc.idx}
                  ref={el => { wrapperRefs.current[i] = el; }}
                  style={{
                    order: getOrder(i, activeService),
                    flex: '0 0 calc((100% - 48px) / 3)',
                  }}
                  onClick={() => handleServiceChange(i)}
                  className="cursor-pointer"
                >
                  <div
                    style={{
                      height: '100%',
                      transform: isFeatured ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
                      transformOrigin: 'center center',
                    }}
                  >
                  <div
                    className={`relative overflow-hidden p-8 rounded-3xl flex flex-col h-full transition-all duration-500 hover:-translate-y-1 ${
                      isFeatured
                        ? 'bg-[#39471D] border border-[#39471D] shadow-[0_2px_6px_rgba(57,71,29,0.35),0_10px_28px_-4px_rgba(57,71,29,0.55)]'
                        : 'bg-gray-50/60 border border-gray-100 hover:border-[#55672E]/20'
                    }`}
                  >
                    {isFeatured && (
                      <img loading="lazy" decoding="async"
                        src="/thallo-digital/isotipo.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute -top-16 -right-16 w-72 rotate-[18deg] opacity-[0.09] pointer-events-none select-none"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    )}

                    <div className="relative flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <span className={`font-mono text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-500 ${isFeatured ? 'text-white/70' : 'text-gray-400'}`}>
                          {svc.idx} / {svc.kicker}
                        </span>
                        {i === 1 && (
                          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#39471D] bg-[#CBD0AC] px-2 py-1 rounded-full">
                            Most chosen
                          </span>
                        )}
                      </div>

                      <h3 className={`text-2xl font-semibold mb-3 transition-colors duration-500 ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                        {svc.title}
                      </h3>
                      <p className={`text-sm leading-relaxed font-medium mb-7 transition-colors duration-500 ${isFeatured ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
                        {svc.desc}
                      </p>

                      <ul className="flex flex-col gap-3">
                        {svc.deliverables.map((item, j) => (
                          <li key={j} className={`flex items-start gap-2.5 text-sm font-medium transition-colors duration-500 ${isFeatured ? 'text-gray-100' : 'text-gray-700'}`}>
                            <Check featured={isFeatured} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`relative mt-8 pt-6 border-t transition-colors duration-500 ${isFeatured ? 'border-white/15' : 'border-gray-200/70'}`}>
                      <span className={`block text-base font-bold tracking-tight transition-colors duration-500 ${isFeatured ? 'text-[#CBD0AC]' : 'text-[#39471D]'}`}>
                        {svc.price}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* The ask under the three plans. It was small enough to read as a
              footnote, and it was the last "Book an audit" still pointing at
              the mailto — every other one goes to /contact/. */}
          <div className="mt-16 flex justify-center">
            <Magnetic>
              <a
                href="/thallo-digital/contact/"
                className="inline-block px-9 py-4 bg-[#39471D] border border-[#39471D] rounded-full text-base font-semibold text-white shadow-[0_18px_36px_-16px_rgba(57,71,29,0.55)] hover:bg-[#55672E] hover:border-[#55672E] transition-all"
              >
                Book an audit &#x2197;
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <EngagementSteps />

      {/* ── Compare ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Barely any margin here: the 128px above the table that gives the
              spinning mark its room already separates this from the panel, and
              mb-14 on top of it left the heading stranded. */}
          <div className="max-w-2xl mb-1">
            <Eyebrow className="mb-5">Compare</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              What is in each.
            </h2>
          </div>

          {/* The mark sits above the recommended column, clear of it — the
              padding here is what keeps it off the header this time, rather
              than a badge overlapping the type. Centred on the Authority Engine
              column (42 + 19 + 10 = 71%), and hidden below lg, where the table
              scrolls inside its panel and 71% of the panel stops being 71% of
              the table. */}
          {/* 88px of mark inside 128px of padding. The clearance has to beat the
              mark's rotated bounding box, not its width — a spinning square
              sweeps out to about 1.41x itself at 45°, so 88 reaches 124 and
              hangs 18px below where it looks like it ends. */}
          <div className="relative pt-32">
            <img
              loading="lazy"
              decoding="async"
              src="/thallo-digital/flower.webp"
              alt=""
              aria-hidden="true"
              className="thallo-spin absolute top-0 left-[71%] hidden h-[88px] w-[88px] -translate-x-1/2 object-contain lg:block"
            />

            {/* A real table now, matched to the trajectory panel on /results/ —
                same shell, same hairlines, same heading type. It was a grid of
                divs, which read to a screen reader as a pile of unrelated text
                rather than a comparison. */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_14px_rgba(20,20,18,0.05)]">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <caption className="sr-only">What each engagement includes</caption>
                  <colgroup>
                    <col className="w-[42%]" />
                    <col className="w-[19%]" />
                    <col className="w-[20%]" />
                    <col className="w-[19%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="border-b border-gray-100 px-7 py-4 text-xs font-medium text-gray-400">
                        Feature
                      </th>
                      <th scope="col" className="border-b border-gray-100 px-4 py-4 text-center text-xs font-medium text-gray-400">
                        Audit
                      </th>
                      {/* A cap, not a bubble — 20px of radius on a 44px header
                          read as a floating pill sitting on the table. */}
                      <th scope="col" className="rounded-t-lg bg-[#39471D] px-4 py-4 text-center text-xs font-semibold text-white">
                        Authority Engine
                      </th>
                      <th scope="col" className="border-b border-gray-100 px-4 py-4 text-center text-xs font-medium text-gray-400">
                        Flagship
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row) => (
                      <tr key={row.feature} className="group border-b border-gray-50 last:border-0">
                        <th scope="row" className="px-7 py-5 text-left transition-colors group-hover:bg-[#F7F8F3]">
                          <span className="flex items-center gap-3.5">
                            <CompareIcon feature={row.feature} />
                            <span className="text-sm font-semibold text-gray-900">{row.feature}</span>
                          </span>
                        </th>
                        <td className="px-4 py-5 text-center transition-colors group-hover:bg-[#F7F8F3]">
                          <CompareCell val={row.audit} />
                        </td>
                        {/* White, like every other column. The tint here was
                            #F7F8F3 — a near-white laid over white, which does
                            not read as a highlight, it reads as a smudge. The
                            olive rules down both sides carry the column
                            instead, cleanly. */}
                        <td className="border-x border-[#39471D]/20 px-4 py-5 text-center transition-colors group-hover:bg-[#F7F8F3]">
                          <CompareCell val={row.engine} />
                        </td>
                        <td className="px-4 py-5 text-center transition-colors group-hover:bg-[#F7F8F3]">
                          <CompareCell val={row.flagship} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">
            <img loading="lazy" decoding="async"
              src="/thallo-digital/cta-bg-services.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ zIndex: 0 }}
            />
            <div className="relative z-[2] max-w-xl">
              <Eyebrow tone="light" className="mb-6">Ready?</Eyebrow>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans">
                Start with a clear look at where you stand.
              </h2>
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch] mb-8">
                Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.
              </p>
              <a
                href="/thallo-digital/contact/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                Book your audit &#x2197;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ (centered) ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-14">
            <Eyebrow center className="mb-5">Questions</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              The honest answers.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-gray-100">
                  <button
                    id={`faq-q-${i}`}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    className="w-full text-left py-6 flex justify-between items-center gap-5 group"
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-[#39471D] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen
                        ? 'bg-[#39471D] border-[#39471D] text-white rotate-45'
                        : 'border-gray-200 text-gray-400'
                    }`}>
                      +
                    </span>
                  </button>
                  {/* Grid rows from 0fr to 1fr, rather than a max-height to a
                      guessed pixel value.

                      The old 300px was far taller than any answer — 138px at
                      desktop width, 229px at 375px. Height is min(content,
                      max-height), so the panel finished opening once max-height
                      passed the content, at roughly half the duration, and the
                      other half ran on an element that had already stopped. It
                      opened through the fast middle of the curve and never
                      reached the ease-out, which is what made it feel abrupt;
                      closing was the same in reverse, a pause and then a drop.

                      1fr is whatever the answer actually measures, so the easing
                      applies to the real distance from first pixel to last. */}
                  <div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pb-6 text-sm text-gray-500 font-medium leading-relaxed max-w-[68ch] transition-opacity duration-300 ${
                          isOpen ? 'opacity-100 delay-150' : 'opacity-0'
                        }`}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
