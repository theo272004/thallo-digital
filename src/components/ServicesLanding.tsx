'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

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

const PROCESS = [
  { idx: '01', period: 'Week 1-3',        title: 'Audit & diagnosis',    desc: 'We benchmark where you show up across Google and AI, score your share of answer, and hand you a prioritized roadmap.' },
  { idx: '02', period: 'Month 1',          title: 'Foundation',           desc: 'We rebuild the technical infrastructure so search engines and AI can read, understand, and cite you, plus your first authority piece.' },
  { idx: '03', period: 'Month 2 onward',   title: 'The Authority Engine', desc: 'Original content, distribution, and visibility work, published and compounded every month, with reporting on real outcomes.' },
  { idx: '04', period: 'When you are ready', title: 'Accelerate',         desc: 'Flagship projects, proprietary studies, digital PR, and interactive tools that put you on the map for good.' },
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

  // Plan builder: pick one base plan (Audit or Authority Engine), then layer on
  // any Flagship items as optional add-ons.
  const [basePlan, setBasePlan] = useState<0 | 1>(1);
  const [addons, setAddons] = useState<string[]>([]);

  function toggleAddon(item: string) {
    setAddons(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  }

  const basePlanData = SERVICES[basePlan];
  const planSummary = addons.length > 0
    ? `${basePlanData.title} + ${addons.length} add-on${addons.length > 1 ? 's' : ''}`
    : basePlanData.title;

  const planMailto = (() => {
    const lines = [
      'Hi Thallo team,',
      '',
      "I'd like to move forward with this plan:",
      '',
      `Base plan: ${basePlanData.title}`,
      addons.length > 0 ? `Add-ons: ${addons.join(', ')}` : 'Add-ons: none yet',
      '',
      'Please reach out to confirm scope and next steps.',
    ];
    const subject = `AI Visibility Plan Request — ${basePlanData.title}`;
    return `mailto:hello@thallo.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  })();

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

          <div className="mt-10 flex justify-center">
            <a
              href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
              className="px-5 py-2.5 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all"
            >
              Book an audit &#x2197;
            </a>
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 2xl:py-16 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Eyebrow center className="mb-5">How an engagement runs</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans">
              What working together looks like.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch] mx-auto">
              A clear arc from first look to compounding results — no hidden phases, no surprises.
            </p>
          </div>
        </div>

        {/* Full-bleed desk banner — spans the full page width, as the section was designed */}
        <div className="w-full mt-6 mb-7 lg:mb-8">
          <img loading="lazy" decoding="async"
            src="/thallo-digital/engagement-desk.webp"
            alt="A Thallo engagement laid out on a desk: visibility audit, brand map, content calendar, distribution plan and results"
            className="w-full h-auto select-none pointer-events-none"
          />
        </div>

        {/* Horizontal timeline: 01 → 02 → 03 → 04 */}
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9">
            {PROCESS.map((step, i) => (
              <div key={step.idx} className="group flex flex-col">
                <div className="flex items-center mb-5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5"
                    style={{ backgroundColor: '#445A20' }}
                  >
                    <span className="text-[13px] font-semibold text-white">{step.idx}</span>
                  </div>
                  {i < PROCESS.length - 1 && (
                    <span
                      className="hidden lg:block h-px flex-1 ml-3"
                      style={{ background: 'linear-gradient(to right, #C7D6A6 0%, rgba(199,214,166,0) 92%)' }}
                    />
                  )}
                </div>
                <span
                  className="self-start inline-flex items-center rounded-full px-2.5 py-1 mb-3 font-mono text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ backgroundColor: '#EEF2E3', color: '#5A7030' }}
                >
                  {step.period}
                </span>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare / Plan builder ───────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <Eyebrow className="mb-5">Build your plan</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-5">
              Choose a plan, add what you need.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[58ch]">
              The Audit and the Authority Engine are the two plans you start with. Flagship Projects are optional add-ons — pick any of them to layer onto your plan.
            </p>
          </div>

          <div
            className="grid lg:grid-cols-[300px_1fr] rounded-[30px] overflow-hidden"
            style={{ border: '1px solid #ECE9E2', boxShadow: '0 18px 55px rgba(32,32,24,.06)' }}
          >
            {/* Left: base plan picker */}
            <div className="bg-[#FAFAF8] border-b lg:border-b-0 lg:border-r border-[#ECE9E2] p-3 flex flex-col gap-2">
              {[0, 1].map((i) => {
                const svc = SERVICES[i];
                const active = basePlan === i;
                return (
                  <button
                    key={svc.idx}
                    onClick={() => setBasePlan(i as 0 | 1)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                      active
                        ? 'bg-[#39471D] text-white shadow-[0_10px_25px_-8px_rgba(57,71,29,0.5)]'
                        : 'bg-transparent text-gray-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className={`font-mono text-[10px] font-bold tracking-[0.16em] uppercase ${active ? 'text-white/60' : 'text-gray-400'}`}>
                        {svc.idx} / Base plan
                      </span>
                      {i === 1 && (
                        <span className={`font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${active ? 'text-[#39471D] bg-[#CBD0AC]' : 'text-[#39471D] bg-[#EEF2E3]'}`}>
                          Most chosen
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-semibold">{svc.title}</div>
                    <div className={`text-xs font-medium mt-1 ${active ? 'text-[#CBD0AC]' : 'text-gray-400'}`}>{svc.price}</div>
                  </button>
                );
              })}

              <div className="p-5 rounded-2xl border border-dashed border-gray-200 mt-1">
                <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-gray-400">
                  03 / Optional add-on
                </span>
                <div className="text-base font-semibold text-gray-900 mt-1.5">Flagship Projects</div>
                <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">Not a plan on its own — pick any items to add, on the right →</p>
              </div>
            </div>

            {/* Right: selected plan detail + add-on picker */}
            <div className="p-8 lg:p-10 bg-white">
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-[#445A20]">
                {basePlanData.title} includes
              </span>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                {basePlanData.deliverables.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm font-medium text-gray-700">
                    <Check featured={false} />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-8 mt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <span className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400">
                    Add flagship items
                  </span>
                  <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{addons.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {SERVICES[2].deliverables.map((item) => {
                    const selected = addons.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleAddon(item)}
                        className={`inline-flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                          selected
                            ? 'bg-[#39471D] border-[#39471D] text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-[#55672E]/40'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] leading-none flex-shrink-0 ${selected ? 'bg-white/20' : 'bg-[#EEF2E3] text-[#445A20]'}`}>
                          {selected ? '✓' : '+'}
                        </span>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live summary of the plan being built */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#FBFCF7] border border-[#edf0e8] px-6 py-5">
                <div>
                  <span className="block text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-1">Your plan</span>
                  <span className="text-base font-semibold text-gray-900">{planSummary}</span>
                </div>
                <a
                  href={planMailto}
                  className="px-5 py-2.5 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all whitespace-nowrap"
                >
                  Request this plan &#x2197;
                </a>
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
                {addons.length > 0
                  ? `Your plan: ${planSummary}. Send it over and we'll confirm scope.`
                  : 'Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.'}
              </p>
              <a
                href={planMailto}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                {addons.length > 0 ? 'Send my plan' : 'Book your audit'} &#x2197;
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
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left py-6 flex justify-between items-center gap-5 group"
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-[#39471D] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#39471D] border-[#39471D] text-white rotate-45'
                        : 'border-gray-200 text-gray-400'
                    }`}>
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '300px' : '0px' }}
                  >
                    <p className="pb-6 text-sm text-gray-500 font-medium leading-relaxed max-w-[68ch]">{faq.a}</p>
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
