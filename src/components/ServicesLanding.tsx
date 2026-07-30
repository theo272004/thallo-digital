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
      <section className="bg-white pt-32 pb-14 2xl:pt-40 2xl:pb-20 border-b border-gray-100">
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
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
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
          <div className="max-w-2xl mb-1">
            <Eyebrow className="mb-5">Build your plan</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-5">
              Choose a plan, add what you need.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[58ch]">
              The Audit and the Authority Engine are the two plans you start with. Flagship Projects are optional add-ons — pick any of them to layer onto your plan.
            </p>
          </div>

          <div className="relative pt-32">
            <SpinFlower className="absolute top-0 left-1/2 hidden h-[88px] w-[88px] -translate-x-1/2 lg:block" />

            <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] lg:grid-cols-[300px_1fr]">
              {/* Left: base plan picker */}
              <div className="flex flex-col gap-2 border-b border-gray-100 bg-[#FAFAF8] p-3 lg:border-b-0 lg:border-r">
                {[0, 1].map((i) => {
                  const svc = SERVICES[i];
                  const active = basePlan === i;
                  return (
                    <button
                      key={svc.idx}
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
                  );
                })}

                <div className="mt-1 rounded-2xl border border-dashed border-gray-200 p-5">
                  <span className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-gray-400">
                    03 / Optional add-on
                  </span>
                  <div className="mt-1.5 text-base font-semibold text-gray-900">Flagship Projects</div>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-gray-400">Not a plan on its own — pick any items to add, on the right →</p>
                </div>
              </div>

              {/* Right: selected plan detail + add-on picker */}
              <div className="bg-white p-8 lg:p-10">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#39471D]">
                  {basePlanData.title} includes
                </span>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {basePlanData.deliverables.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-medium text-gray-700">
                      <Check featured={false} />
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
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live summary of the plan being built — feeds the enquiry
                    form below, so the plan travels with the visitor rather
                    than resetting at the CTA. */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#edf0e8] bg-[#FBFCF7] px-6 py-5">
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
        heading="Start with a clear look at where you stand."
        copy={
          addons.length > 0
            ? `Your plan: ${planSummary}. Send it over and we'll confirm scope.`
            : 'Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.'
        }
        plans={[SERVICES[0].title, SERVICES[1].title, ...SERVICES[2].deliverables]}
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
