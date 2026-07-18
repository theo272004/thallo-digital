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

function CompareCell({ val }: { val: boolean | string }) {
  if (val === true) return (
    <div className="w-8 h-8 rounded-full bg-[#EEF1E6] flex items-center justify-center transition-transform duration-200 hover:scale-110">
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#3E531C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8l4 4 7-7"/></svg>
    </div>
  );
  if (val === false) return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 hover:scale-110">
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
    </div>
  );
  return <span className="text-sm font-bold text-[#3E531C]">{val}</span>;
}

function CompareIcon({ feature }: { feature: string }) {
  const s = { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none' as const, stroke: '#3E531C', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const map: Record<string, React.ReactNode> = {
    'AI visibility benchmark':       <svg {...s}><circle cx="11" cy="11" r="7"/><path d="M5 11s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="11" cy="11" r="2.5" fill="#3E531C"/></svg>,
    'Technical AI-readiness build':  <svg {...s}><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="2" y="2" width="20" height="20" rx="3"/></svg>,
    'Original, researched content':  <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'Distribution & publishing':     <svg {...s}><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><line x1="8.3" y1="13.3" x2="15.7" y2="17.7"/><line x1="15.7" y1="6.3" x2="8.3" y2="10.7"/></svg>,
    'Proprietary data studies':      <svg {...s}><line x1="18" y1="20" x2="18" y2="9"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="13"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    'Digital PR & podcasts':         <svg {...s}><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    'Monthly outcome reporting':     <svg {...s}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    'Best for':                      <svg {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#3E531C"/></svg>,
  };
  return <span className="flex-shrink-0">{map[feature] ?? null}</span>;
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
          <img
            src="/thallo-digital/flower.png"
            alt="Thallo"
            className="w-20 h-20 object-contain opacity-80"
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
                      <img
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
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <Eyebrow className="mb-5">How an engagement runs</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans">
              What working together looks like.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch]">
              A clear arc from first look to compounding results — no hidden phases, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((step) => (
              <div
                key={step.idx}
                className="p-8 rounded-3xl bg-gray-50/60 border border-gray-100 flex flex-col gap-4"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E7ECD9' }}>
                  <span className="text-[11px] font-semibold" style={{ color: '#39471D' }}>{step.idx}</span>
                </div>
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">{step.period}</p>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <Eyebrow className="mb-5">Compare</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              What is in each.
            </h2>
          </div>

          {/* Premium floating card */}
          <div className="rounded-[28px] border border-[#ECE9E2] bg-white shadow-[0_4px_40px_-12px_rgba(57,71,29,0.12)] overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">

                {/* Header row */}
                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <div className="flex items-end py-5 px-7 border-b border-[#ECE9E2]">
                    <span className="text-[10px] font-bold tracking-[0.20em] uppercase text-gray-400">Feature</span>
                  </div>
                  <div className="flex items-end justify-center py-5 px-6 border-b border-[#ECE9E2] border-l border-[#ECE9E2]">
                    <span className="text-[10px] font-bold tracking-[0.20em] uppercase text-gray-500">Audit</span>
                  </div>
                  {/* Authority Engine — taller, olive, badge + label */}
                  <div className="flex flex-col items-center justify-end py-6 px-6 bg-[#3E531C]" style={{ borderLeft: '1px solid #3E531C', borderRight: '1px solid #3E531C' }}>
                    <div className="w-[46px] h-[46px] rounded-full bg-white/[0.12] flex items-center justify-center mb-3 ring-[1.5px] ring-white/20">
                      <img src="/thallo-digital/flower.png" alt="" aria-hidden className="w-[22px] h-[22px] object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.20em] uppercase text-white/90">Authority Engine</span>
                  </div>
                  <div className="flex items-end justify-center py-5 px-6 border-b border-[#ECE9E2] border-l border-[#ECE9E2]">
                    <span className="text-[10px] font-bold tracking-[0.20em] uppercase text-gray-500">Flagship</span>
                  </div>
                </div>

                {/* Data rows */}
                {COMPARE.map((row, i) => (
                  <div
                    key={i}
                    className="grid group transition-colors duration-[250ms]"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderTop: '1px solid #ECE9E2' }}
                  >
                    {/* Feature + icon */}
                    <div className="flex items-center gap-4 py-[18px] px-7 group-hover:bg-[#F8F9F3] transition-colors duration-[250ms]">
                      <CompareIcon feature={row.feature} />
                      <span className="text-[14px] font-medium text-gray-800 leading-snug">{row.feature}</span>
                    </div>
                    {/* Audit */}
                    <div className="flex items-center justify-center py-[18px] px-6 group-hover:bg-[#F8F9F3] transition-colors duration-[250ms]" style={{ borderLeft: '1px solid #ECE9E2' }}>
                      <CompareCell val={row.audit} />
                    </div>
                    {/* Authority Engine — warm tint column */}
                    <div className="flex items-center justify-center py-[18px] px-6 bg-[#F8F9F3]" style={{ borderLeft: '1px solid #e5ecd8', borderRight: '1px solid #e5ecd8' }}>
                      <CompareCell val={row.engine} />
                    </div>
                    {/* Flagship */}
                    <div className="flex items-center justify-center py-[18px] px-6 group-hover:bg-[#F8F9F3] transition-colors duration-[250ms]" style={{ borderLeft: '1px solid #ECE9E2' }}>
                      <CompareCell val={row.flagship} />
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">
            <img
              src="/thallo-digital/cta-bg-services.png"
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
                href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
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
