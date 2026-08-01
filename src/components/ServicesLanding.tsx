'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import SpinFlower from '@/components/ui/SpinFlower';
import EngagementSteps from '@/components/EngagementSteps';
import AuditCTA from '@/components/AuditCTA';
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
    price: 'From $800 · one-time · no lock-in',
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
    price: 'From $2,500 / month · 6-month term',
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
    price: 'From $600 · priced by scope',
  },
];

const FAQS = [
  { q: 'What if AI says something wrong about us?',              a: 'It happens, and there is no edit button. No AI company lets you log in and correct it. What you can do is make the accurate version of your story the strongest, most consistent signal across the places AI reads, so the correct answer becomes the one it repeats. Getting that right is a large part of our work, and it is why precision matters to us more than volume.' },
  { q: 'Can you prove it is working?',                           a: 'Yes, with honesty about what is measurable and what is not. We track how often you appear in AI answers for the questions your buyers ask, the sources citing you, and the pipeline your presence influences. What no one can promise is perfect click-by-click attribution; AI search is newer and messier than Google. We report the real signals, not a vanity dashboard, and we are straight about the limits.' },
  { q: 'Will this bring us more customers?',                     a: 'We build the preference, visibility, and pipeline that make you far more likely to win, and keep you on the shortlist. What we will not do is promise a fixed number of sales. In a long, multi-person buying decision, anyone who does is guessing.' },
  { q: 'How fast will we see results?',                          a: 'Faster than old-school SEO. Because AI reads and cites fresh content in real time, early movement — first mentions and first citations — can show up within weeks, not the long months traditional search used to demand. The deeper, compounding authority builds from there.' },
  { q: 'Where do we start, and how much do we have to commit?', a: 'Almost everyone begins with the audit: fixed scope, no lock-in, and you walk away with a clear picture and a roadmap you keep whether or not you continue. It is the fastest way to see exactly where you stand, and what the opportunity is worth, before committing to anything bigger.' },
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

/**
 * The "included" marker: a filled olive disc with the tick cut out of it.
 *
 * Disc and tick are one SVG, and that is the point. Drawn as a CSS circle with
 * a separate tick centred on top, the two shapes land on fractional pixels in a
 * fluid grid and round their antialiasing independently — at this size that
 * reads as a tick sitting slightly off centre, differently in every column.
 * One path cannot disagree with itself.
 */
function Tick({ featured = false }: { featured?: boolean }) {
  return (
    <span className="block h-[19px] w-[19px] flex-shrink-0" aria-hidden="true">
      <svg viewBox="0 0 26 26" className="h-full w-full">
        <circle cx="13" cy="13" r="13" fill={featured ? '#CBD0AC' : '#39471D'} />
        <polyline
          points="8.7 13 11.4 15.7 17.3 10.3"
          fill="none" stroke={featured ? '#39471D' : '#FFFFFF'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * A glyph per deliverable, keyed by the deliverable's own text.
 *
 * Keyed by string rather than carried on the data because these lines are
 * copy first — they get reworded — and a missing key falls through to null
 * rather than throwing or drawing the wrong thing.
 */
function FeatureIcon({ item }: { item: string }) {
  const p = {
    viewBox: '0 0 24 24', width: 15, height: 15, fill: 'none' as const,
    stroke: 'currentColor', strokeWidth: 1.9,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const map: Record<string, React.ReactNode> = {
    // ── Audit ──
    'Visibility benchmark vs. rivals': <svg {...p}><line x1="18" y1="20" x2="18" y2="9"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="13"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    'Share-of-answer scoring':         <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10h-10z"/></svg>,
    'Technical readiness review':      <svg {...p}><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="2" y="2" width="20" height="20" rx="3"/></svg>,
    'Content & authority gaps':        <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'Prioritized 90-day roadmap':      <svg {...p}><polyline points="3 6 4.5 7.5 7.5 4.5"/><polyline points="3 12 4.5 13.5 7.5 10.5"/><polyline points="3 18 4.5 19.5 7.5 16.5"/><line x1="11" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/></svg>,
    'Competitor teardown':             <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/></svg>,

    // ── Authority Engine ──
    'Deeply researched content':       <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'Technical AI-readiness build':    <svg {...p}><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="2" y="2" width="20" height="20" rx="3"/></svg>,
    'Search & AI visibility':          <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    'Distribution to buyer channels':  <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    'Consistent brand narrative':      <svg {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
    'Monthly outcome reporting':       <svg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,

    // ── Flagship ──
    'Proprietary data studies':        <svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
    'Industry reports':                <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="13" x2="8" y2="13"/></svg>,
    'Digital PR & podcasts':           <svg {...p}><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    'Interactive tools':               <svg {...p}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
    'Signature research':              <svg {...p}><circle cx="12" cy="8" r="6"/><polyline points="8.2 13.4 7 22 12 19 17 22 15.8 13.4"/></svg>,
    'Launch strategy':                 <svg {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/></svg>,
  };
  return <>{map[item] ?? null}</>;
}

/**
 * Desktop lays the three side by side and puts the active one in the middle;
 * stacked on a phone the middle is nowhere, so the active one goes on top and
 * the other two keep their natural sequence below it.
 *
 * Written as whole class strings because Tailwind reads the source as text —
 * a built-up `lg:order-${n}` is invisible to it and never gets generated.
 */
const ORDER = {
  mobile: ['order-1', 'order-2', 'order-3'],
  desktop: ['lg:order-1', 'lg:order-2', 'lg:order-3'],
};

function orderClasses(cardIdx: number, active: number): string {
  const others = [0, 1, 2].filter(i => i !== active);
  const rank = cardIdx === active ? 0 : others.indexOf(cardIdx) + 1; // 0-based
  const desktop = cardIdx === active ? 1 : (cardIdx === others[0] ? 0 : 2);
  return `${ORDER.mobile[rank]} ${ORDER.desktop[desktop]}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [activeService, setActiveService] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Plan builder: pick one base plan (Audit or Authority Engine), then layer
  // on any Flagship items as optional add-ons. Flagship is never a base plan
  // on its own — it only exists to be added to one of the other two.
  const [basePlan, setBasePlan] = useState<0 | 1>(1);
  const [addons, setAddons] = useState<string[]>([]);

  function toggleAddon(item: string) {
    setAddons(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  }

  const basePlanData = SERVICES[basePlan];
  const planSummary = addons.length > 0
    ? `${basePlanData.title} + ${addons.length} add-on${addons.length > 1 ? 's' : ''}`
    : basePlanData.title;
  const builtPlan = [basePlanData.title, ...addons];

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
      <section className="bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <Eyebrow center className="mb-5">Our Plans</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            One engine to make you<br />the answer.
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Everything we do builds toward one outcome: making you the name buyers and AI trust.
          </p>
          <SpinFlower alt="Thallo" className="block w-20 h-20 opacity-80" />
        </div>
      </section>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      {/* Asymmetric on purpose: the hero above already ends in whitespace, so
          the full py-16/py-28 on top of it stacked into a blank band. The
          bottom keeps its generosity — it is the one separating two dense
          sections. */}
      <section className="bg-white pt-10 pb-16 2xl:pt-14 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-gray-100/80 rounded-full p-1 gap-1">
              {SERVICES.map((svc, i) => (
                <button
                  key={svc.idx}
                  onClick={() => handleServiceChange(i)}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
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

          {/* Cards grid — FLIP-animated across, stacked down on phones */}
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch" style={{ minHeight: 0 }}>
            {SERVICES.map((svc, i) => {
              const isFeatured = i === activeService;
              return (
                <div
                  key={svc.idx}
                  ref={el => { wrapperRefs.current[i] = el; }}
                  onClick={() => handleServiceChange(i)}
                  className={`cursor-pointer w-full lg:w-[calc((100%-48px)/3)] lg:flex-none ${orderClasses(i, activeService)}`}
                >
                  {/* The 1.08 lift is desktop-only: stacked, the cards are the
                      full column width, so scaling one just pushes it past the
                      screen edge. */}
                  <div
                    className={`h-full origin-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isFeatured ? 'lg:scale-[1.08]' : ''
                    }`}
                  >
                  <div
                    className={`relative overflow-hidden p-8 rounded-3xl flex flex-col h-full transition-all duration-500 hover:-translate-y-1 ${
                      isFeatured
                        ? 'bg-[#39471D] border border-[#39471D] shadow-[0_2px_6px_rgba(57,71,29,0.35),0_10px_28px_-4px_rgba(57,71,29,0.55)]'
                        : 'bg-gray-50/60 border border-gray-200 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] hover:border-[#55672E]/20'
                    }`}
                  >
                    {isFeatured && (
                      <img loading="lazy" decoding="async"
                        src="/thallo-digital/isotipo.png"
                        alt=""
                        aria-hidden="true"
                        /* Sat on the corner rather than tucked inside it. At
                           -64px of a 288px mark the whole flower cleared the
                           edge with room to spare, so it read as a sticker
                           dropped in the card. Half of it hangs out now and
                           the card crops the rest — the mark belongs to the
                           corner instead of floating near it. */
                        className="absolute -top-[10.5rem] -right-[10.5rem] w-[26rem] rotate-[18deg] opacity-[0.11] pointer-events-none select-none"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    )}

                    <div className="relative flex-1">
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <span className={`font-mono text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-500 ${isFeatured ? 'text-white/70' : 'text-gray-400'}`}>
                          {svc.idx} / {svc.kicker}
                        </span>
                        {i === 1 && (
                          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#39471D] bg-[#CBD0AC] px-2 py-1 rounded-full">
                            Most chosen
                          </span>
                        )}
                        {i === 2 && (
                          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Optional add-on
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

          {/* The ask under the three plans. Now that the enquiry form lives on
              this page, it hands off there instead of to /contact/ — the plan
              you were reading arrives pre-ticked. */}
          <div className="mt-14 flex justify-center">
            <Magnetic>
              <a
                href="#enquiry"
                className="inline-block px-9 py-4 bg-[#39471D] border border-[#39471D] rounded-full text-base font-semibold text-white shadow-[0_18px_36px_-16px_rgba(57,71,29,0.55)] hover:bg-[#55672E] hover:border-[#55672E] transition-all"
              >
                Book an audit <ArrowUpRight className="ml-0.5" />
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <EngagementSteps />

      {/* ── Compare / plan builder ───────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-5">Build your plan</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-5">
              Choose a plan, add what you need.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[58ch]">
              The Audit and the Authority Engine are the two plans you start with. Flagship Projects are optional add-ons — pick any of them to layer onto your plan.
            </p>
          </div>

          {/* No overflow-hidden on the panel: the flower hangs off its left
              edge, and clipping is what a rounded corner needs from the
              columns themselves, not from the whole grid. */}
          <div className="relative">
            <div className="grid rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] lg:grid-cols-[300px_1fr]">
              {/* Left: base plan picker */}
              <div className="flex flex-col gap-2 rounded-t-3xl border-b border-gray-100 bg-[#FAFAF8] p-3 lg:rounded-l-3xl lg:rounded-tr-none lg:border-b-0 lg:border-r">
                {[0, 1].map((i) => {
                  const svc = SERVICES[i];
                  const active = basePlan === i;
                  return (
                    <div key={svc.idx} className="relative">
                    <button
                      type="button"
                      onClick={() => setBasePlan(i as 0 | 1)}
                      aria-pressed={active}
                      className={`w-full rounded-2xl p-5 text-left transition-all duration-300 ${
                        active
                          ? 'bg-[#39471D] text-white shadow-[0_10px_25px_-8px_rgba(57,71,29,0.5)]'
                          : 'bg-transparent text-gray-700 hover:bg-white'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className={`font-mono text-[11px] font-bold tracking-[0.16em] uppercase ${active ? 'text-white/60' : 'text-gray-400'}`}>
                          {svc.idx} / Base plan
                        </span>
                        {i === 1 && (
                          <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest ${active ? 'bg-[#CBD0AC] text-[#39471D]' : 'bg-[#EEF2E3] text-[#39471D]'}`}>
                            Most chosen
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-semibold">{svc.title}</div>
                      <div className={`mt-1 text-xs font-medium ${active ? 'text-[#CBD0AC]' : 'text-gray-400'}`}>{svc.price}</div>
                    </button>

                    {/* Clear of the panel, not sunk into it.
                        -translate-x-1/2 centred the mark on the button's left
                        edge, which sits 12px inside the panel — so two thirds
                        of the flower landed on the card and it read as caught
                        under it. -translate-x-full puts its right edge on that
                        line and -ml-4 carries it 16px further, past the panel
                        border, so the whole mark sits in the margin.

                        -ml-3 is exactly the column's own p-3, so the mark's
                        right edge lands on the panel border itself — tangent
                        to it, at every width, rather than at an offset that
                        drifts as the panel grows. It cannot go further: the
                        panel is max-w-1440 with px-6, so between lg and 1440
                        the gutter is all there is, and at 1024 the flower
                        already fills it corner to corner.

                        Grabbable again, which is the other half of moving it
                        out. Sat over the button it needed pointer-events-none
                        or it would swallow clicks on the control it decorates
                        — and that also killed the drag, so this was the one
                        mark on the site you could not flick. Out here it
                        overlaps nothing, so it behaves like all the others. */}
                    {i === 1 && (
                      <SpinFlower className="absolute top-1/2 left-0 z-10 -ml-3 hidden h-[68px] w-[68px] -translate-x-full -translate-y-1/2 lg:block" />
                    )}
                    </div>
                  );
                })}

                {/* No Flagship card here. This column is the base plans, and
                    the Flagship items are the add-ons picked on the right — a
                    third card announcing them only restated the paragraph
                    above and made the column look like three choices. */}
              </div>

              {/* Right: selected plan detail + add-on picker */}
              <div className="bg-white p-8 lg:p-10">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#39471D]">
                  {basePlanData.title} includes
                </span>
                {/* Tick, then the line's own glyph, then the words. The tick
                    says "you get this"; the glyph says what it is. They do
                    different jobs, so both earn their place — the glyph is
                    drawn a shade lighter and a size smaller so the column of
                    ticks stays the thing the eye runs down. */}
                <ul className="mt-4 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                  {basePlanData.deliverables.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                      <Tick />
                      <span className="flex shrink-0 text-[#55672E]/70"><FeatureIcon item={item} /></span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-gray-100 pt-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Add flagship items
                    </span>
                    <span className="whitespace-nowrap text-xs font-medium text-gray-400">{addons.length} selected</span>
                  </div>
                  {/* The chips keep +/✓ rather than the Tick disc: these are
                      controls, and the glyph has to say "press me to add" and
                      then "added", which a static included-marker cannot. The
                      line's own icon comes along so a chip and its twin in the
                      list above are recognisably the same item. */}
                  <div className="flex flex-wrap gap-2.5">
                    {SERVICES[2].deliverables.map((item) => {
                      const selected = addons.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleAddon(item)}
                          aria-pressed={selected}
                          className={`inline-flex items-center gap-2 rounded-full border py-2 pl-2.5 pr-4 text-sm font-semibold transition-all duration-200 ${
                            selected
                              ? 'border-[#39471D] bg-[#39471D] text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#55672E]/40'
                          }`}
                        >
                          <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[12px] leading-none ${selected ? 'bg-white/20' : 'bg-[#EEF2E3] text-[#39471D]'}`}>
                            {selected ? '✓' : '+'}
                          </span>
                          <span className={`flex shrink-0 ${selected ? 'text-[#CBD0AC]' : 'text-[#55672E]/70'}`}>
                            <FeatureIcon item={item} />
                          </span>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live summary of the plan being built — feeds the enquiry
                    form below, so the plan travels with the visitor rather
                    than resetting at the CTA. */}
                {/* Grey, not the green tint it was: the tinted bands on this
                    site are #F7F8F9 now, and a lone greenish panel in here
                    read as a colour we no longer use. */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#F7F8F9] px-6 py-5">
                  <div>
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Your plan</span>
                    <span className="text-base font-semibold text-gray-900">{planSummary}</span>
                  </div>
                  <Magnetic>
                    <a
                      href="#enquiry"
                      className="inline-flex items-center whitespace-nowrap rounded-full border border-[#39471D] bg-[#39471D] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-[#55672E] hover:bg-[#55672E]"
                    >
                      Request this plan <ArrowUpRight className="ml-0.5" />
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA, with the enquiry form inside it ──────────────────────────── */}
      {/* Whatever was built above — base plan plus any add-ons — arrives
          pre-ticked, so the selection travels into the enquiry rather than
          resetting here. This page is the only one that has a builder to feed
          it; everywhere else the form opens on the three plans. */}
      <AuditCTA
        image="/thallo-digital/cta-bg-services.webp"
        eyebrow="Ready?"
        /* Broken by hand: left to wrap it took three lines and stretched the
           panel with it. */
        heading={<>Start with a clear look<br />at where you stand.</>}
        copy={
          addons.length > 0
            ? `Your plan: ${planSummary}. Send it over and we'll confirm scope.`
            : 'Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.'
        }
        /* The three plans, same as every other enquiry form on the site. The
           builder's add-ons still travel via activePlans — they just do not
           each get a chip of their own here, which turned three options into
           eight. */
        activePlans={builtPlan}
      />

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
